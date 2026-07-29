const {
    listLoginActivity
} = require("../../services/userLoginActivity.service");

exports.listUserLoginActivity = async (req, res) => {
    try {
        const result = await listLoginActivity(req.query);
        return res.status(200).json({
            status: "success",
            ...result
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            status: "fail",
            message: error.statusCode
                ? error.message
                : "Unable to retrieve user login activity."
        });
    }
};
