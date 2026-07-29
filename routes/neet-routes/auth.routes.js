const express = require('express');
const authRouter = express.Router();
const authController = require('../../controllers/neet-controller/auth.contorllers');
const passwordResetController = require('../../controllers/neet-controller/passwordReset.controller');
// Google authentication is temporarily disabled. Keep this import commented so
// the password-setup implementation can be restored with the routes below.
// const passwordSetupController = require('../../controllers/neet-controller/passwordSetup.controller');
const { protect } = require('../../utilities/auth');
const signupController = require('../../controllers/neet-controller/signup.controller');
const {
    loginLimiter,
    // googleLoginLimiter,
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

// Google login and its password-setup routes are temporarily disabled.
// The controller/service code and existing database fields are intentionally
// preserved so the feature can be restored without a data migration.
// authRouter.post('/google', googleLoginLimiter, authController.googleLogin);
// authRouter.post(
//     '/google/password/setup-link',
//     protect,
//     otpLimiter,
//     passwordSetupController.requestSetupEmail
// );
// authRouter.post(
//     '/google/password',
//     otpVerificationLimiter,
//     passwordSetupController.setPassword
// );

authRouter.post('/refresh-token', tokenLimiter, authController.refreshToken);
authRouter.post('/logout', protect, authController.logout);
authRouter.post('/logout-all', protect, authController.logoutAll);

authRouter.post('/forgot-password', otpLimiter, passwordResetController.requestPasswordResetOtp);
authRouter.post('/verify-reset-otp', otpVerificationLimiter, passwordResetController.verifyPasswordResetOtp);
authRouter.post('/reset-password', passwordResetController.resetPassword);
authRouter.post('/change-password', protect, passwordResetController.changePassword);

module.exports = authRouter;
