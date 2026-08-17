"use strict";

const crypto = require("crypto");
const validator = require("validator");
const Auth = require("../../model/neet-models/auth");
const SignupOtp = require("../../model/neet-models/signupOtp");
const { createAuthSession } = require("../../services/authToken.service");
const { normalizePhone, sendWhatsappOtp } = require("../../services/twilioWhatsapp.service");

const OTP_VALID_MINUTES = 5;
const RESEND_SECONDS = 60;
const MAX_ATTEMPTS = 5;

const hashOtp = (otp) => crypto
    .createHmac("sha256", process.env.SIGNUP_OTP_SECRET || process.env.RESET_OTP_SECRET || process.env.SECRET_KEY || "MBBS_OTP_SECRET_KEY")
    .update(String(otp))
    .digest("hex");

const phoneVariants = (phone) => {
    if (!phone) return [];
    const last10 = phone.slice(-10);
    return [...new Set([phone, last10, `+91${last10}`, `91${last10}`])];
};

/**
 * Step 1: POST /api/v1/auth/register (or /sign-up)
 * Validates full name & WhatsApp number, generates OTP on backend, and dispatches via Twilio WhatsApp.
 */
exports.startSignup = async (req, res) => {
    try {
        const rawName = req.body.fullName || req.body.name || `${req.body.firstName || ""} ${req.body.lastName || ""}`.trim();
        const fullName = typeof rawName === "string" ? rawName.trim() : "";
        const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const rawPhone = req.body.phoneNumber || req.body.phone || req.body.whatsappNumber || req.body.whatsapp_number;
        const phoneNumber = normalizePhone(rawPhone);

        if (!fullName || fullName.length < 2) {
            return res.status(400).json({
                status: "fail",
                message: "Please enter your full name."
            });
        }

        if (!phoneNumber) {
            return res.status(400).json({
                status: "fail",
                message: "Please enter a valid WhatsApp number."
            });
        }

        if (email && !validator.isEmail(email)) {
            return res.status(400).json({
                status: "fail",
                message: "Please enter a valid email address."
            });
        }

        // Check if phone number is already registered in neet-auth
        const existingUser = await Auth.findOne({
            phoneNumber: { $in: phoneVariants(phoneNumber) }
        }).lean();

        if (existingUser) {
            return res.status(409).json({
                status: "fail",
                message: "This mobile number is already registered. Please log in."
            });
        }

        // Cooldown check for resending
        const existingOtp = await SignupOtp.findOne({ phone_number: phoneNumber, purpose: "signup" }).lean();
        if (existingOtp?.resend_available_at > new Date()) {
            const seconds = Math.ceil((existingOtp.resend_available_at.getTime() - Date.now()) / 1000);
            return res.status(429).json({
                status: "fail",
                message: `Please wait ${seconds} seconds before requesting another OTP.`,
                retry_after_seconds: seconds
            });
        }

        // Backend OTP generation (4 digits)
        const otp = crypto.randomInt(1000, 10000).toString();
        const now = Date.now();

        // Split name into first and last name if needed
        const nameParts = fullName.split(/\s+/);
        const firstName = nameParts[0] || fullName;
        const lastName = nameParts.slice(1).join(" ") || "";

        // Save OTP hash in database
        await SignupOtp.findOneAndUpdate(
            { phone_number: phoneNumber },
            {
                $set: {
                    full_name: fullName,
                    first_name: firstName,
                    last_name: lastName,
                    email: email || "",
                    otp_hash: hashOtp(otp),
                    otp_expires_at: new Date(now + OTP_VALID_MINUTES * 60000),
                    resend_available_at: new Date(now + RESEND_SECONDS * 1000),
                    attempts: 0,
                    verified: false,
                    used_at: null,
                    purpose: "signup",
                    twilio_message_sid: null,
                    twilio_message_status: null,
                    twilio_error_code: null,
                    twilio_error_message: null
                },
                $setOnInsert: { phone_number: phoneNumber }
            },
            { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );

        // Dispatch OTP via Twilio WhatsApp
        let delivery;
        try {
            delivery = await sendWhatsappOtp(phoneNumber, otp, "registration");
            await SignupOtp.updateOne(
                { phone_number: phoneNumber },
                {
                    $set: {
                        twilio_message_sid: delivery.sid,
                        twilio_message_status: delivery.status
                    }
                }
            );
        } catch (twilioErr) {
            console.error("[Twilio WhatsApp Delivery Error]:", twilioErr.message);
            await SignupOtp.updateOne(
                { phone_number: phoneNumber },
                {
                    $set: {
                        twilio_message_status: "failed",
                        twilio_error_message: twilioErr.message
                    }
                }
            );
            // In development or sandbox, still allow test proceeding if sandbox join is pending
            if (process.env.NODE_ENV === "development") {
                console.log(`[DEV OTP Fallback] Verification code for ${phoneNumber} is: ${otp}`);
            } else {
                return res.status(502).json({
                    status: "fail",
                    message: `Unable to deliver WhatsApp message: ${twilioErr.message}`
                });
            }
        }

        return res.status(200).json({
            status: "success",
            message: "We've sent a verification code to your WhatsApp.",
            data: {
                phoneNumber,
                expiresInMinutes: OTP_VALID_MINUTES
            }
        });

    } catch (error) {
        console.error("Error in startSignup:", error);
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

/**
 * Step 2: POST /api/v1/auth/register/verify-otp
 * Verifies OTP on backend, creates new student record in neet-auth, and issues session tokens.
 */
exports.verifySignupOtp = async (req, res) => {
    try {
        const rawPhone = req.body.phoneNumber || req.body.phone || req.body.whatsappNumber || req.body.whatsapp_number;
        const phoneNumber = normalizePhone(rawPhone);
        const otp = typeof req.body.otp === "string" ? req.body.otp.trim() : String(req.body.otp || "").trim();

        if (!phoneNumber || !/^\d{4,6}$/.test(otp)) {
            return res.status(400).json({
                status: "fail",
                message: "A valid WhatsApp number and 4-digit OTP are required."
            });
        }

        const record = await SignupOtp.findOne({ phone_number: phoneNumber, used_at: null })
            .select("+otp_hash");

        if (!record || record.otp_expires_at <= new Date()) {
            return res.status(400).json({
                status: "fail",
                message: "OTP is invalid or expired. Please request a new code."
            });
        }

        if (record.attempts >= MAX_ATTEMPTS) {
            return res.status(429).json({
                status: "fail",
                message: "Maximum OTP attempts exceeded. Please request a new verification code."
            });
        }

        const suppliedHash = hashOtp(otp);
        const isMatch = crypto.timingSafeEqual(Buffer.from(record.otp_hash, "hex"), Buffer.from(suppliedHash, "hex"));

        if (!isMatch) {
            record.attempts += 1;
            await record.save();
            return res.status(400).json({
                status: "fail",
                message: "Incorrect verification code. Please check and try again."
            });
        }

        // Final uniqueness check before insertion
        if (await Auth.exists({ phoneNumber: { $in: phoneVariants(phoneNumber) } })) {
            return res.status(409).json({
                status: "fail",
                message: "This mobile number is already registered. Please log in."
            });
        }

        const fullName = record.full_name || `${record.first_name || ""} ${record.last_name || ""}`.trim() || "Student";
        const nameParts = fullName.split(/\s+/);
        const firstName = record.first_name || nameParts[0] || fullName;
        const lastName = record.last_name || nameParts.slice(1).join(" ") || "";

        // Create new user in neet-auth collection
        const newUser = await Auth.create({
            fullName,
            firstName,
            lastName,
            phoneNumber,
            email: record.email || undefined,
            auth_providers: ["whatsapp"],
            is_active: true
        });

        record.verified = true;
        record.used_at = new Date();
        await record.save();

        // Create auth session & JWT tokens
        const { accessToken, refreshToken, sessionId } = await createAuthSession(newUser, req);

        return res.status(201).json({
            status: "success",
            message: "WhatsApp number verified and account created successfully.",
            data: {
                student_id: newUser.student_id,
                user: {
                    id: newUser._id,
                    student_id: newUser.student_id,
                    fullName: newUser.fullName,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    phoneNumber: newUser.phoneNumber,
                    email: newUser.email || null
                },
                accessToken,
                authtoken: accessToken,
                refreshToken
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                status: "fail",
                message: "This WhatsApp number or email is already registered."
            });
        }
        console.error("Error in verifySignupOtp:", error);
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

/**
 * POST /api/v1/auth/resend-otp
 */
exports.resendOtp = async (req, res) => {
    try {
        const rawPhone = req.body.phoneNumber || req.body.phone || req.body.whatsappNumber;
        const phoneNumber = normalizePhone(rawPhone);
        const purpose = req.body.purpose === "login" ? "login" : "signup";

        if (!phoneNumber) {
            return res.status(400).json({
                status: "fail",
                message: "Please enter a valid WhatsApp number."
            });
        }

        const existingRecord = await SignupOtp.findOne({ phone_number: phoneNumber }).lean();
        if (existingRecord?.resend_available_at > new Date()) {
            const seconds = Math.ceil((existingRecord.resend_available_at.getTime() - Date.now()) / 1000);
            return res.status(429).json({
                status: "fail",
                message: `Please wait ${seconds} seconds before requesting another code.`,
                retry_after_seconds: seconds
            });
        }

        const otp = crypto.randomInt(1000, 10000).toString();
        const now = Date.now();

        await SignupOtp.findOneAndUpdate(
            { phone_number: phoneNumber },
            {
                $set: {
                    otp_hash: hashOtp(otp),
                    otp_expires_at: new Date(now + OTP_VALID_MINUTES * 60000),
                    resend_available_at: new Date(now + RESEND_SECONDS * 1000),
                    attempts: 0,
                    verified: false,
                    used_at: null,
                    purpose
                },
                $setOnInsert: { phone_number: phoneNumber }
            },
            { upsert: true, new: true }
        );

        try {
            await sendWhatsappOtp(phoneNumber, otp, purpose === "login" ? "sign-in" : "registration");
        } catch (err) {
            console.error("[Twilio WhatsApp Resend Error]:", err.message);
        }

        return res.status(200).json({
            status: "success",
            message: "A fresh verification code has been sent to your WhatsApp.",
            data: { phoneNumber, expiresInMinutes: OTP_VALID_MINUTES }
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};
