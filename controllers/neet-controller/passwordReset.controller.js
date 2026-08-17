const crypto = require("crypto");
const twilio = require("twilio");
const Auth = require("../../model/neet-models/auth");
const PasswordReset = require("../../model/neet-models/passwordReset");

const OTP_VALID_MINUTES = 5;
const RESET_TOKEN_VALID_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 15;
const MAX_OTP_ATTEMPTS = 5;

const hashValue = value => crypto
    .createHmac("sha256", process.env.RESET_OTP_SECRET || process.env.SECRET_KEY)
    .update(String(value))
    .digest("hex");

const normalizePhoneNumber = value => {
    if (typeof value !== "string") return null;
    const cleaned = value.trim().replace(/[\s()-]/g, "");

    if (/^\+[1-9]\d{7,14}$/.test(cleaned)) return cleaned;
    if (/^\d{10}$/.test(cleaned)) return `+91${cleaned}`;
    return null;
};

const findUserByPhone = async (rawPhone, normalizedPhone) => {
    const localNumber = normalizedPhone.slice(-10);
    return Auth.findOne({
        phoneNumber: { $in: [...new Set([rawPhone.trim(), normalizedPhone, localNumber])] }
    });
};

const getTwilioClient = () => {
    // The current configuration stores the Twilio Auth Token in
    // TWILIO_API_SECRET. TWILIO_AUTH_TOKEN is also supported as the clearer name.
    const authToken = process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_API_SECRET;
    const requiredVariables = ["TWILIO_ACCOUNT_SID", "TWILIO_PHONE_NUMBER"];
    const missing = requiredVariables.filter(name => !process.env[name]);
    if (!authToken) missing.push("TWILIO_AUTH_TOKEN (or TWILIO_API_SECRET)");
    if (missing.length) throw new Error(`Missing Twilio configuration: ${missing.join(", ")}`);

    return twilio(
        process.env.TWILIO_ACCOUNT_SID.trim(),
        authToken.trim()
    );
};

exports.requestPasswordResetOtp = async (req, res) => {
    try {
        const normalizedPhone = normalizePhoneNumber(req.body.phoneNumber);
        if (!normalizedPhone) {
            return res.status(400).json({
                status: "fail",
                message: "Enter a valid phoneNumber, for example +918012036989."
            });
        }

        const user = await findUserByPhone(req.body.phoneNumber, normalizedPhone);
        if (!user) {
            return res.status(404).json({
                status: "fail",
                message: "No account was found for this phone number."
            });
        }

        const existingReset = await PasswordReset.findOne({ user_id: user._id }).lean();
        if (existingReset?.resend_available_at > new Date()) {
            const retryAfter = Math.ceil((existingReset.resend_available_at.getTime() - Date.now()) / 1000);
            return res.status(429).json({
                status: "fail",
                message: `Please wait ${retryAfter} seconds before requesting another OTP.`,
                retry_after_seconds: retryAfter
            });
        }

        const otp = crypto.randomInt(1000, 10000).toString();
        const now = Date.now();
        await PasswordReset.findOneAndUpdate(
            { user_id: user._id },
            {
                $set: {
                    phone_number: normalizedPhone,
                    otp_hash: hashValue(otp),
                    otp_expires_at: new Date(now + OTP_VALID_MINUTES * 60 * 1000),
                    resend_available_at: new Date(now + RESEND_COOLDOWN_SECONDS * 1000),
                    attempts: 0,
                    verified: false,
                    reset_token_hash: null,
                    reset_token_expires_at: null,
                    twilio_message_sid: null,
                    twilio_message_status: null,
                    twilio_error_code: null,
                    twilio_error_message: null,
                    used_at: null
                },
                $setOnInsert: { user_id: user._id }
            },
            { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );

        let twilioMessage;
        try {
            twilioMessage = await getTwilioClient().messages.create({
                from: process.env.TWILIO_PHONE_NUMBER,
                to: normalizedPhone,
                body: `Your MBBS NEET password reset OTP is ${otp}. It expires in ${OTP_VALID_MINUTES} minutes. Do not share this OTP.`
            });
        } catch (error) {
            await PasswordReset.updateOne(
                { user_id: user._id },
                {
                    $set: {
                        twilio_message_status: "failed",
                        twilio_error_code: Number(error.code) || null,
                        twilio_error_message: error.message || "Unable to send OTP."
                    }
                }
            );
            return res.status(502).json({
                status: "fail",
                message: `Unable to send OTP: ${error.message}`
            });
        }

        await PasswordReset.updateOne(
            { user_id: user._id },
            {
                $set: {
                    twilio_message_sid: twilioMessage.sid,
                    twilio_message_status: twilioMessage.status,
                    twilio_error_code: null,
                    twilio_error_message: null
                }
            }
        );

        return res.status(200).json({
            status: "success",
            message: "OTP generated and accepted by Twilio for delivery.",
            data: {
                deliveryStatus: twilioMessage.status,
                expiresInMinutes: OTP_VALID_MINUTES
            }
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.verifyPasswordResetOtp = async (req, res) => {
    try {
        const normalizedPhone = normalizePhoneNumber(req.body.phoneNumber);
        const otp = typeof req.body.otp === "string" ? req.body.otp.trim() : "";
        if (!normalizedPhone || !/^\d{4,6}$/.test(otp)) {
            return res.status(400).json({
                status: "fail",
                message: "A valid phoneNumber and 4-digit OTP are required."
            });
        }

        const reset = await PasswordReset.findOne({
            phone_number: normalizedPhone,
            used_at: null
        }).select("+otp_hash");

        if (!reset || reset.otp_expires_at <= new Date()) {
            return res.status(400).json({ status: "fail", message: "OTP is invalid or expired." });
        }
        if (reset.attempts >= MAX_OTP_ATTEMPTS) {
            return res.status(429).json({
                status: "fail",
                message: "Maximum OTP attempts reached. Request a new OTP."
            });
        }

        const suppliedHash = hashValue(otp);
        const matches = crypto.timingSafeEqual(
            Buffer.from(reset.otp_hash, "hex"),
            Buffer.from(suppliedHash, "hex")
        );

        if (!matches) {
            reset.attempts += 1;
            await reset.save();
            return res.status(400).json({ status: "fail", message: "OTP is invalid or expired." });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const tokenExpiry = new Date(Date.now() + RESET_TOKEN_VALID_MINUTES * 60 * 1000);
        reset.verified = true;
        reset.reset_token_hash = hashValue(resetToken);
        reset.reset_token_expires_at = tokenExpiry;
        await reset.save();

        return res.status(200).json({
            status: "success",
            message: "OTP verified successfully.",
            data: { resetToken, expiresInMinutes: RESET_TOKEN_VALID_MINUTES }
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { resetToken, password, confirmPassword } = req.body;
        if (typeof resetToken !== "string" || !resetToken.trim()) {
            return res.status(400).json({ status: "fail", message: "resetToken is required." });
        }
        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({
                status: "fail",
                message: "password must be at least 8 characters long."
            });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ status: "fail", message: "Passwords do not match." });
        }

        const reset = await PasswordReset.findOne({
            reset_token_hash: hashValue(resetToken.trim()),
            verified: true,
            used_at: null,
            reset_token_expires_at: { $gt: new Date() }
        }).select("+reset_token_hash");

        if (!reset) {
            return res.status(400).json({
                status: "fail",
                message: "Reset token is invalid or expired."
            });
        }

        const user = await Auth.findById(reset.user_id);
        if (!user) {
            return res.status(404).json({ status: "fail", message: "User account not found." });
        }

        user.password = password;
        user.confirmPassword = confirmPassword;
        user.token_version = (user.token_version || 0) + 1;
        await user.save();

        reset.used_at = new Date();
        await reset.save();

        return res.status(200).json({
            status: "success",
            message: "Password reset successfully. You can now log in with the new password."
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (typeof currentPassword !== "string" || !currentPassword) {
            return res.status(400).json({
                status: "fail",
                message: "currentPassword is required."
            });
        }
        if (typeof newPassword !== "string" || newPassword.length < 8) {
            return res.status(400).json({
                status: "fail",
                message: "newPassword must be at least 8 characters long."
            });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                status: "fail",
                message: "newPassword and confirmPassword do not match."
            });
        }
        if (currentPassword === newPassword) {
            return res.status(400).json({
                status: "fail",
                message: "The new password must be different from the current password."
            });
        }

        const user = await Auth.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ status: "fail", message: "User account not found." });
        }

        const currentPasswordMatches = await user.comparePassword(
            currentPassword,
            user.password
        );
        if (!currentPasswordMatches) {
            return res.status(403).json({
                status: "fail",
                message: "Current password is incorrect."
            });
        }

        user.password = newPassword;
        user.confirmPassword = confirmPassword;
        user.token_version = (user.token_version || 0) + 1;
        await user.save();

        return res.status(200).json({
            status: "success",
            message: "Password changed successfully."
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};
