const {
    sendPasswordSetupEmail,
    setGoogleAccountPassword
} = require("../../services/passwordSetup.service");

const sendError = (res, error) => res.status(error.statusCode || 500).json({
    status: "fail",
    message: error.statusCode ? error.message : "An unexpected server error occurred.",
    ...(error.retryAfterSeconds
        ? { retryAfterSeconds: error.retryAfterSeconds }
        : {})
});

exports.requestSetupEmail = async (req, res) => {
    try {
        const data = await sendPasswordSetupEmail(req.user.id);
        return res.status(200).json({
            status: "success",
            message: "Password setup email sent successfully.",
            data
        });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.setPassword = async (req, res) => {
    try {
        const data = await setGoogleAccountPassword(req.body);
        return res.status(200).json({
            status: "success",
            message: "Password created successfully. You can now use Google or email and password to log in.",
            data
        });
    } catch (error) {
        return sendError(res, error);
    }
};
