const noopMiddleware = (req, res, next) => next();

const apiLimiter = noopMiddleware;
const loginLimiter = noopMiddleware;
const googleLoginLimiter = noopMiddleware;
const signupLimiter = noopMiddleware;
const otpLimiter = noopMiddleware;
const otpVerificationLimiter = noopMiddleware;
const tokenLimiter = noopMiddleware;
const mutationLimiter = noopMiddleware;
const aiLimiter = noopMiddleware;
const adminLimiter = noopMiddleware;

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

