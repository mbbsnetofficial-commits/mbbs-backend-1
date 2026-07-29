const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Auth = require("../model/neet-models/auth");
const PasswordSetupToken = require("../model/neet-models/passwordSetupToken");

const TOKEN_VALID_MINUTES = 15;
const RESEND_COOLDOWN_SECONDS = 60;

const serviceError = (statusCode, message) =>
    Object.assign(new Error(message), { statusCode });

const hashToken = token => crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

const getSetupPageUrl = token => {
    const configuredUrl = process.env.PASSWORD_SETUP_FRONTEND_URL ||
        `${String(process.env.FRONTEND_URL || "").split(",")[0].trim()}/set-password`;

    let url;
    try {
        url = new URL(configuredUrl);
    } catch {
        throw serviceError(503, "Password setup frontend URL is not configured.");
    }
    if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
        throw serviceError(503, "Password setup frontend URL must use HTTPS.");
    }
    url.searchParams.set("token", token);
    return url.toString();
};

const getTransport = () => {
    const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM"];
    const missing = required.filter(name => !process.env[name]?.trim());
    if (missing.length) {
        throw serviceError(503, `Email service is not configured: ${missing.join(", ")}`);
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST.trim(),
        port: Number(process.env.SMTP_PORT),
        secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
        auth: {
            user: process.env.SMTP_USER.trim(),
            pass: process.env.SMTP_PASSWORD.trim()
        }
    });
};

const requireEligibleGoogleUser = async userId => {
    const user = await Auth.findById(userId);
    if (!user || user.is_active === false) {
        throw serviceError(404, "Active user account not found.");
    }
    if (!user.firebase_uid || !user.auth_providers?.includes("google")) {
        throw serviceError(403, "Password setup is available only for verified Google accounts.");
    }
    if (user.password) {
        throw serviceError(409, "This account already has a password. Use change password instead.");
    }
    return user;
};

exports.sendPasswordSetupEmail = async userId => {
    const user = await requireEligibleGoogleUser(userId);
    const existing = await PasswordSetupToken.findOne({ user_id: user._id }).lean();
    if (existing?.resend_available_at > new Date()) {
        const retryAfterSeconds = Math.ceil(
            (existing.resend_available_at.getTime() - Date.now()) / 1000
        );
        throw Object.assign(
            serviceError(429, `Please wait ${retryAfterSeconds} seconds before requesting another email.`),
            { retryAfterSeconds }
        );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const now = Date.now();
    const tokenRecord = await PasswordSetupToken.findOneAndUpdate(
        { user_id: user._id },
        {
            $set: {
                email: user.email,
                token_hash: hashToken(token),
                expires_at: new Date(now + TOKEN_VALID_MINUTES * 60 * 1000),
                resend_available_at: new Date(now + RESEND_COOLDOWN_SECONDS * 1000),
                used_at: null
            },
            $setOnInsert: { user_id: user._id }
        },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    try {
        await getTransport().sendMail({
            from: process.env.SMTP_FROM.trim(),
            to: user.email,
            subject: "Create your MBBS.NET password",
            text: [
                `Hello ${user.firstName},`,
                "",
                "Your Google account is connected to MBBS.NET.",
                "Create your MBBS.NET password using this secure link:",
                getSetupPageUrl(token),
                "",
                `This one-time link expires in ${TOKEN_VALID_MINUTES} minutes.`,
                "If you did not request this, you can ignore this email."
            ].join("\n")
        });
    } catch (error) {
        await PasswordSetupToken.deleteOne({ _id: tokenRecord._id });
        if (error.statusCode) throw error;
        throw serviceError(502, "Unable to send the password setup email.");
    }

    return {
        email: user.email,
        expiresInMinutes: TOKEN_VALID_MINUTES
    };
};

exports.setGoogleAccountPassword = async ({ token, password, confirmPassword }) => {
    const normalizedToken = typeof token === "string" ? token.trim() : "";
    if (!/^[a-f0-9]{64}$/i.test(normalizedToken)) {
        throw serviceError(400, "Password setup token is invalid or expired.");
    }
    if (typeof password !== "string" || password.length < 8) {
        throw serviceError(400, "password must be at least 8 characters long.");
    }
    if (password !== confirmPassword) {
        throw serviceError(400, "password and confirmPassword do not match.");
    }

    const setup = await PasswordSetupToken.findOneAndUpdate(
        {
            token_hash: hashToken(normalizedToken),
            used_at: null,
            expires_at: { $gt: new Date() }
        },
        { $set: { used_at: new Date() } },
        { new: true }
    ).select("+token_hash");

    if (!setup) {
        throw serviceError(400, "Password setup token is invalid or expired.");
    }

    try {
        const user = await requireEligibleGoogleUser(setup.user_id);
        user.password = password;
        user.confirmPassword = confirmPassword;
        user.auth_providers = [...new Set([...(user.auth_providers || []), "password"])];
        await user.save();
        return { email: user.email, authProviders: user.auth_providers };
    } catch (error) {
        await PasswordSetupToken.updateOne(
            { _id: setup._id, used_at: setup.used_at },
            { $set: { used_at: null } }
        );
        throw error;
    }
};
