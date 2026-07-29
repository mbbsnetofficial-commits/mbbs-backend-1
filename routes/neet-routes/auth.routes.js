const express = require('express');
const authRouter = express.Router();
const authController = require('../../controllers/neet-controller/auth.contorllers');
const passwordResetController = require('../../controllers/neet-controller/passwordReset.controller');
const { protect } = require('../../utilities/auth');
const signupController = require('../../controllers/neet-controller/signup.controller');
const {
    loginLimiter,
    googleLoginLimiter,
    signupLimiter,
    otpLimiter,
    otpVerificationLimiter,
    tokenLimiter
} = require('../../middleware/rateLimit.middleware');

authRouter.route('/register')
    .post(signupLimiter, otpLimiter, signupController.startSignup)

authRouter.post('/register/verify-otp', otpVerificationLimiter, signupController.verifySignupOtp);
authRouter.post('/sign-up', signupLimiter, otpLimiter, signupController.startSignup);
authRouter.post('/sign-up/verify-otp', otpVerificationLimiter, signupController.verifySignupOtp);

authRouter.route('/login')
    .post(loginLimiter, authController.login)

authRouter.post('/google', googleLoginLimiter, authController.googleLogin);

authRouter.post('/refresh-token', tokenLimiter, authController.refreshToken);
authRouter.post('/logout', protect, authController.logout);
authRouter.post('/logout-all', protect, authController.logoutAll);

authRouter.post('/forgot-password', otpLimiter, passwordResetController.requestPasswordResetOtp);
authRouter.post('/verify-reset-otp', otpVerificationLimiter, passwordResetController.verifyPasswordResetOtp);
authRouter.post('/reset-password', passwordResetController.resetPassword);
authRouter.post('/change-password', protect, passwordResetController.changePassword);

module.exports = authRouter;
