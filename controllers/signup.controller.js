const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const twilio = require("twilio");
const validator = require("validator");
const Auth = require("../model/auth");
const SignupOtp = require("../model/signupOtp");
const { createAuthSession } = require("../services/authToken.service");

const OTP_VALID_MINUTES = 5;
const RESEND_SECONDS = 60;
const MAX_ATTEMPTS = 5;

const normalizePhone = value => {
    if (typeof value !== "string") return null;
    const cleaned = value.trim().replace(/[\s()-]/g, "");
    if (/^\+[1-9]\d{7,14}$/.test(cleaned)) return cleaned;
    if (/^\d{10}$/.test(cleaned)) return `+91${cleaned}`;
    return null;
};

const hashOtp = otp => crypto
    .createHmac("sha256", process.env.SIGNUP_OTP_SECRET || process.env.RESET_OTP_SECRET || process.env.SECRET_KEY)
    .update(String(otp))
    .digest("hex");

const phoneVariants = phone => [...new Set([phone, phone.slice(-10)])];

const getTwilioClient = () => {
    const authToken = process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_API_SECRET;
    if (!process.env.TWILIO_ACCOUNT_SID || !authToken || !process.env.TWILIO_PHONE_NUMBER) {
        throw new Error("Twilio is not completely configured.");
    }
    return twilio(process.env.TWILIO_ACCOUNT_SID.trim(), authToken.trim());
};

exports.startSignup = async (req, res) => {
    try {
        const firstName = typeof req.body.firstName === "string" ? req.body.firstName.trim() : "";
        const lastName = typeof req.body.lastName === "string" ? req.body.lastName.trim() : "";
        const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const phoneNumber = normalizePhone(req.body.phoneNumber);
        const { password, confirmPassword } = req.body;

        if (!firstName || !validator.isAlpha(firstName) || !lastName || !validator.isAlpha(lastName)) {
            return res.status(400).json({ status: "fail", message: "firstName and lastName must contain only letters." });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ status: "fail", message: "A valid email is required." });
        }
        if (!phoneNumber) {
            return res.status(400).json({ status: "fail", message: "A valid phoneNumber is required." });
        }
        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({ status: "fail", message: "password must be at least 8 characters long." });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ status: "fail", message: "Passwords do not match." });
        }

        const existingUser = await Auth.findOne({
            $or: [
                { email },
                { phoneNumber: { $in: phoneVariants(phoneNumber) } }
            ]
        }).lean();
        if (existingUser) {
            return res.status(409).json({ status: "fail", message: "Email or mobile number is already registered." });
        }

        const existingRequest = await SignupOtp.findOne({ phone_number: phoneNumber }).lean();
        if (existingRequest?.used_at) {
            return res.status(409).json({ status: "fail", message: "This mobile number has already been used." });
        }
        if (existingRequest?.resend_available_at > new Date()) {
            const seconds = Math.ceil((existingRequest.resend_available_at.getTime() - Date.now()) / 1000);
            return res.status(429).json({
                status: "fail",
                message: `Please wait ${seconds} seconds before requesting another OTP.`,
                retry_after_seconds: seconds
            });
        }

        const otp = crypto.randomInt(100000, 1000000).toString();
        const now = Date.now();
        const passwordHash = await bcrypt.hash(password, 10);
        await SignupOtp.findOneAndUpdate(
            { phone_number: phoneNumber },
            { $set: {
                first_name: firstName,
                last_name: lastName,
                email,
                password_hash: passwordHash,
                otp_hash: hashOtp(otp),
                otp_expires_at: new Date(now + OTP_VALID_MINUTES * 60000),
                resend_available_at: new Date(now + RESEND_SECONDS * 1000),
                attempts: 0,
                verified: false,
                twilio_message_sid: null,
                twilio_message_status: null,
                twilio_error_code: null,
                twilio_error_message: null
            }, $setOnInsert: { phone_number: phoneNumber } },
            { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );

        let sms;
        try {
            sms = await getTwilioClient().messages.create({
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phoneNumber,
                body: `Your MBBS NEET sign-up OTP is ${otp}. It expires in ${OTP_VALID_MINUTES} minutes. Do not share this OTP.`
            });
        } catch (error) {
            await SignupOtp.updateOne({ phone_number: phoneNumber }, { $set: {
                twilio_message_status: "failed",
                twilio_error_code: Number(error.code) || null,
                twilio_error_message: error.message || "Unable to send OTP."
            } });
            return res.status(502).json({ status: "fail", message: `Unable to send OTP: ${error.message}` });
        }

        await SignupOtp.updateOne({ phone_number: phoneNumber }, { $set: {
            twilio_message_sid: sms.sid,
            twilio_message_status: sms.status
        } });

        return res.status(200).json({
            status: "success",
            message: "Sign-up OTP generated and accepted by Twilio for delivery.",
            data: { phoneNumber, deliveryStatus: sms.status, expiresInMinutes: OTP_VALID_MINUTES }
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.verifySignupOtp = async (req, res) => {
    try {
        const phoneNumber = normalizePhone(req.body.phoneNumber);
        const otp = typeof req.body.otp === "string" ? req.body.otp.trim() : "";
        if (!phoneNumber || !/^\d{6}$/.test(otp)) {
            return res.status(400).json({ status: "fail", message: "A valid phoneNumber and 6-digit OTP are required." });
        }

        const record = await SignupOtp.findOne({ phone_number: phoneNumber, used_at: null })
            .select("+otp_hash +password_hash");
        if (!record || record.otp_expires_at <= new Date()) {
            return res.status(400).json({ status: "fail", message: "OTP is invalid or expired." });
        }
        if (record.attempts >= MAX_ATTEMPTS) {
            return res.status(429).json({ status: "fail", message: "Maximum OTP attempts reached. Start sign-up again." });
        }

        const suppliedHash = hashOtp(otp);
        const matches = crypto.timingSafeEqual(Buffer.from(record.otp_hash, "hex"), Buffer.from(suppliedHash, "hex"));
        if (!matches) {
            record.attempts += 1;
            await record.save();
            return res.status(400).json({ status: "fail", message: "OTP is invalid or expired." });
        }

        if (await Auth.exists({ $or: [
            { email: record.email },
            { phoneNumber: { $in: phoneVariants(phoneNumber) } }
        ] })) {
            return res.status(409).json({ status: "fail", message: "Email or mobile number is already registered." });
        }

        const user = await Auth.create({
            firstName: record.first_name,
            lastName: record.last_name,
            email: record.email,
            phoneNumber,
            password: record.password_hash,
            confirmPassword: record.password_hash
        });

        record.verified = true;
        record.used_at = new Date();
        await record.save();

        const { accessToken: authtoken, refreshToken } = await createAuthSession(user, req);

        return res.status(201).json({
            status: "success",
            message: "Mobile number verified and account created successfully.",
            data: {
                user: { id: user._id, student_id: user.student_id, firstName: user.firstName, lastName: user.lastName, email: user.email, phoneNumber: user.phoneNumber },
                authtoken,
                refreshToken
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ status: "fail", message: "Email or mobile number is already registered." });
        }
        return res.status(500).json({ status: "fail", message: error.message });
    }
};
