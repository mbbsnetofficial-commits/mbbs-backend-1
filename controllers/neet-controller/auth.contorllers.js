"use strict";

const crypto = require("crypto");
const Auth = require('../../model/neet-models/auth');
const SignupOtp = require('../../model/neet-models/signupOtp');
const { getFirebaseAuth } = require("../../config/firebaseAdmin");
const {
    createAuthSession,
    rotateAuthSession,
    revokeSession,
    revokeAllSessions
} = require('../../services/authToken.service');
const {
    recordSuccessfulLogin
} = require("../../services/userLoginActivity.service");
const { normalizePhone, sendWhatsappOtp } = require("../../services/twilioWhatsapp.service");

const OTP_VALID_MINUTES = 5;
const RESEND_SECONDS = 15;
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
 * Step 1: POST /api/v1/auth/login
 * Handles WhatsApp OTP sign-in request (Image 1) or legacy email/password.
 */
exports.login = async (req, res) => {
    try {
        const body = req.body || {};
        const rawPhone = body.phoneNumber || body.phone || body.whatsappNumber || body.whatsapp_number;
        const phoneNumber = normalizePhone(rawPhone);
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const password = body.password;

        // WhatsApp OTP Login Flow (Primary)
        if (phoneNumber) {
            const user = await Auth.findOne({
                phoneNumber: { $in: phoneVariants(phoneNumber) }
            });

            if (!user) {
                return res.status(404).json({
                    status: "fail",
                    message: "No account found with this WhatsApp number. Please create an account."
                });
            }

            if (user.is_active === false) {
                return res.status(403).json({
                    status: "fail",
                    message: "This account has been deactivated. Please contact support."
                });
            }

            // Check resend cooldown
            const existingOtp = await SignupOtp.findOne({ phone_number: phoneNumber, purpose: "login" }).lean();
            if (existingOtp?.resend_available_at > new Date()) {
                const seconds = Math.ceil((existingOtp.resend_available_at.getTime() - Date.now()) / 1000);
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
                        purpose: "login",
                        twilio_message_sid: null,
                        twilio_message_status: null
                    },
                    $setOnInsert: { phone_number: phoneNumber }
                },
                { upsert: true, new: true }
            );

            // Dispatch OTP via Twilio WhatsApp
            try {
                const delivery = await sendWhatsappOtp(phoneNumber, otp, "sign-in");
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
                console.error("[Twilio WhatsApp Login Error]:", twilioErr.message);
                if (process.env.NODE_ENV === "development") {
                    console.log(`[DEV OTP Fallback] Login verification code for ${phoneNumber} is: ${otp}`);
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
        }

        // Fallback Email & Password Login Flow
        if (email) {
            if (!password) {
                return res.status(400).json({
                    status: "fail",
                    message: "Please enter your password."
                });
            }

            const user = await Auth.findOne({ email });
            if (!user) {
                return res.status(401).json({
                    status: "fail",
                    message: "Invalid email or password."
                });
            }
            if (user.is_active === false) {
                return res.status(403).json({
                    status: "fail",
                    message: "This account has been deactivated."
                });
            }

            if (!user.password) {
                return res.status(401).json({
                    status: "fail",
                    message: "Invalid email or password."
                });
            }

            const match = await user.comparePassword(password, user.password);
            if (!match) {
                return res.status(401).json({
                    status: "fail",
                    message: "Invalid email or password."
                });
            }

            const { accessToken, refreshToken, sessionId } = await createAuthSession(user, req);
            try {
                await recordSuccessfulLogin({ user, sessionId, req });
            } catch (e) {
                // Ignore activity error
            }

            return res.status(200).json({
                status: "success",
                message: "Login successful.",
                data: {
                    student_id: user.student_id,
                    user: {
                        id: user._id,
                        student_id: user.student_id,
                        fullName: user.fullName,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        phoneNumber: user.phoneNumber
                    },
                    accessToken,
                    authtoken: accessToken,
                    refreshToken
                }
            });
        }

        return res.status(400).json({
            status: "fail",
            message: "Please provide a valid WhatsApp number to log in."
        });

    } catch (err) {
        console.error("Error in login:", err);
        return res.status(500).json({
            status: "fail",
            message: err.message
        });
    }
};

/**
 * Step 2: POST /api/v1/auth/login/verify-otp (or /verify-otp)
 * Verifies the OTP sent to student's WhatsApp and issues JWT access and refresh tokens.
 */
exports.verifyLoginOtp = async (req, res) => {
    try {
        const body = req.body || {};
        const rawPhone = body.phoneNumber || body.phone || body.whatsappNumber || body.whatsapp_number;
        const phoneNumber = normalizePhone(rawPhone);
        const otp = typeof body.otp === "string" ? body.otp.trim() : String(body.otp || "").trim();

        if (!phoneNumber || !/^\d{4,6}$/.test(otp)) {
            return res.status(400).json({
                status: "fail",
                message: "A valid WhatsApp number and 4-digit verification code are required."
            });
        }

        const record = await SignupOtp.findOne({ phone_number: phoneNumber, used_at: null })
            .select("+otp_hash");

        if (!record || record.otp_expires_at <= new Date()) {
            return res.status(400).json({
                status: "fail",
                message: "Verification code is invalid or expired. Please request a new code."
            });
        }

        if (record.attempts >= MAX_ATTEMPTS) {
            return res.status(429).json({
                status: "fail",
                message: "Maximum verification attempts exceeded. Please request a new code."
            });
        }

        const suppliedHash = hashOtp(otp);
        const isMatch = crypto.timingSafeEqual(Buffer.from(record.otp_hash, "hex"), Buffer.from(suppliedHash, "hex"));

        if (!isMatch) {
            record.attempts += 1;
            await record.save();
            return res.status(400).json({
                status: "fail",
                message: "Incorrect verification code. Please try again."
            });
        }

        // Fetch user from neet-auth
        let user = await Auth.findOne({
            phoneNumber: { $in: phoneVariants(phoneNumber) }
        });

        if (!user) {
            return res.status(404).json({
                status: "fail",
                message: "Account not found for this WhatsApp number. Please sign up."
            });
        }

        if (user.is_active === false) {
            return res.status(403).json({
                status: "fail",
                message: "This account has been deactivated."
            });
        }

        record.verified = true;
        record.used_at = new Date();
        await record.save();

        const { accessToken, refreshToken, sessionId } = await createAuthSession(user, req);

        try {
            await recordSuccessfulLogin({ user, sessionId, req });
        } catch (activityError) {
            console.error("Unable to store user login activity:", activityError.message);
        }

        return res.status(200).json({
            status: "success",
            message: "Login successful.",
            data: {
                student_id: user.student_id,
                user: {
                    id: user._id,
                    student_id: user.student_id,
                    fullName: user.fullName,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phoneNumber: user.phoneNumber,
                    email: user.email || null
                },
                accessToken,
                authtoken: accessToken,
                refreshToken
            }
        });

    } catch (err) {
        console.error("Error in verifyLoginOtp:", err);
        return res.status(500).json({
            status: "fail",
            message: err.message
        });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = typeof req.body.refreshToken === "string"
            ? req.body.refreshToken.trim()
            : "";
        if (!refreshToken) {
            return res.status(400).json({ status: "fail", message: "refreshToken is required." });
        }
        const tokens = await rotateAuthSession(refreshToken, req);
        return res.status(200).json({ status: "success", data: tokens });
    } catch (error) {
        return res.status(error.statusCode || 401).json({ status: "fail", message: error.message || "Invalid refresh token." });
    }
};

exports.logout = async (req, res) => {
    try {
        if (!req.user.session_id) {
            return res.status(400).json({ status: "fail", message: "This access token is not linked to a login session. Please use logout-all." });
        }
        await revokeSession(req.user.session_id);
        return res.status(200).json({ status: "success", message: "Logged out from the current session successfully." });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.logoutAll = async (req, res) => {
    try {
        const user = await Auth.findById(req.user.id);
        if (!user) return res.status(404).json({ status: "fail", message: "User account not found." });
        user.token_version = (user.token_version || 0) + 1;
        await user.save();
        await revokeAllSessions(user._id);
        return res.status(200).json({ status: "success", message: "Logged out from all sessions successfully." });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};
