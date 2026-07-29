const { rateLimit } = require("express-rate-limit");

const numberFromEnv = (name, fallback) => {
    const value = Number(process.env[name]);
    return Number.isFinite(value) && value > 0 ? value : fallback;
};

const buildLimiter = ({
    windowMs,
    limit,
    message,
    skipSuccessfulRequests = false
}) => rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (req, res) => res.status(429).json({
        status: "fail",
        message,
        retryAfterSeconds: Math.max(
            1,
            Math.ceil(((req.rateLimit?.resetTime?.getTime() || Date.now()) - Date.now()) / 1000)
        )
    })
});

// Every /api/v1 request passes through this baseline protection.
const apiLimiter = buildLimiter({
    windowMs: numberFromEnv("RATE_LIMIT_API_WINDOW_MS", 15 * 60 * 1000),
    limit: numberFromEnv("RATE_LIMIT_API_MAX", 300),
    message: "Too many API requests. Please try again later."
});

// Successful logins do not consume the failed-attempt allowance.
const loginLimiter = buildLimiter({
    windowMs: numberFromEnv("RATE_LIMIT_LOGIN_WINDOW_MS", 15 * 60 * 1000),
    limit: numberFromEnv("RATE_LIMIT_LOGIN_MAX", 5),
    skipSuccessfulRequests: true,
    message: "Too many failed login attempts. Please try again after 15 minutes."
});

// Google already rate-limits its OAuth flow and Firebase verifies every ID
// token. Keep a separate, less aggressive backend allowance so popup retries
// and shared networks do not exhaust the password-login limit.
const googleLoginLimiter = buildLimiter({
    windowMs: numberFromEnv("RATE_LIMIT_GOOGLE_LOGIN_WINDOW_MS", 15 * 60 * 1000),
    limit: numberFromEnv("RATE_LIMIT_GOOGLE_LOGIN_MAX", 30),
    skipSuccessfulRequests: true,
    message: "Too many failed Google sign-in attempts. Please try again later."
});

const signupLimiter = buildLimiter({
    windowMs: numberFromEnv("RATE_LIMIT_SIGNUP_WINDOW_MS", 60 * 60 * 1000),
    limit: numberFromEnv("RATE_LIMIT_SIGNUP_MAX", 5),
    message: "Too many signup requests. Please try again later."
});

const otpLimiter = buildLimiter({
    windowMs: numberFromEnv("RATE_LIMIT_OTP_WINDOW_MS", 10 * 60 * 1000),
    limit: numberFromEnv("RATE_LIMIT_OTP_MAX", 3),
    message: "Too many OTP requests. Please wait before trying again."
});

const otpVerificationLimiter = buildLimiter({
    windowMs: numberFromEnv("RATE_LIMIT_OTP_VERIFY_WINDOW_MS", 15 * 60 * 1000),
    limit: numberFromEnv("RATE_LIMIT_OTP_VERIFY_MAX", 8),
    skipSuccessfulRequests: true,
    message: "Too many invalid OTP attempts. Please try again later."
});

const tokenLimiter = buildLimiter({
    windowMs: numberFromEnv("RATE_LIMIT_TOKEN_WINDOW_MS", 15 * 60 * 1000),
    limit: numberFromEnv("RATE_LIMIT_TOKEN_MAX", 30),
    message: "Too many token requests. Please login again later."
});

const writeLimiter = buildLimiter({
    windowMs: numberFromEnv("RATE_LIMIT_WRITE_WINDOW_MS", 15 * 60 * 1000),
    limit: numberFromEnv("RATE_LIMIT_WRITE_MAX", 60),
    message: "Too many write requests. Please try again later."
});

const mutationLimiter = (req, res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    return writeLimiter(req, res, next);
};

const aiLimiter = buildLimiter({
    windowMs: numberFromEnv("RATE_LIMIT_AI_WINDOW_MS", 60 * 1000),
    limit: numberFromEnv("RATE_LIMIT_AI_MAX", 15),
    message: "Too many AI requests. Please wait before sending another request."
});

const adminLimiter = buildLimiter({
    windowMs: numberFromEnv("RATE_LIMIT_ADMIN_WINDOW_MS", 15 * 60 * 1000),
    limit: numberFromEnv("RATE_LIMIT_ADMIN_MAX", 150),
    message: "Too many admin requests. Please try again later."
});

module.exports = {
    apiLimiter,
    loginLimiter,
    googleLoginLimiter,
    signupLimiter,
    otpLimiter,
    otpVerificationLimiter,
    tokenLimiter,
    mutationLimiter,
    aiLimiter,
    adminLimiter
};
