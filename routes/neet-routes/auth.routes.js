const express = require('express');
const authRouter = express.Router();
const authController = require('../../controllers/neet-controller/auth.contorllers');
const passwordResetController = require('../../controllers/neet-controller/passwordReset.controller');
const { protect } = require('../../utilities/auth');
const signupController = require('../../controllers/neet-controller/signup.controller');

authRouter.route('/register')
    .post(signupController.startSignup)

authRouter.post('/register/verify-otp', signupController.verifySignupOtp);
authRouter.post('/sign-up', signupController.startSignup);
authRouter.post('/sign-up/verify-otp', signupController.verifySignupOtp);

authRouter.route('/login')
    .post(authController.login)

authRouter.post('/refresh-token', authController.refreshToken);
authRouter.post('/logout', protect, authController.logout);
authRouter.post('/logout-all', protect, authController.logoutAll);

authRouter.post('/forgot-password', passwordResetController.requestPasswordResetOtp);
authRouter.post('/verify-reset-otp', passwordResetController.verifyPasswordResetOtp);
authRouter.post('/reset-password', passwordResetController.resetPassword);
authRouter.post('/change-password', protect, passwordResetController.changePassword);

module.exports = authRouter;
