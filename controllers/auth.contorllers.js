const Auth = require('./../model/auth');
const jwt = require('jsonwebtoken');
const {
    createAuthSession,
    rotateAuthSession,
    revokeSession,
    revokeAllSessions
} = require('../services/authToken.service');

exports.register = async (req, res) => {
    try {
        const newUser = await Auth.create(req.body);

        // const authtoken = jwt.sign(
        //     { id: newUser._id },
        //     process.env.SECRET_KEY,
        //     {
        //         expiresIn: process.env.LOGIN_EXPIRES
        //     }
        // );

        // const refreshtoken = jwt.sign(
        //     { id: newUser._id },
        //     process.env.REFRESH_SECRET_KEY,
        //     {
        //         expiresIn: process.env.REFRESH_TOKEN_EXPIRES
        //     }
        // )

        res.status(200).json({
            status: 'status',
            message: 'user created successfully',
            data: {
                newUser,
            }
        })
    } catch (err) {
        res.status(500).json({
            status: 'Fail',
            message: err.message,
        })
    }
}

exports.login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        if (!email || email === '') {
            return res.status(400).json({
                status: 'fail',
                message: "please enter the valid email"
            })
        }
        if (!password || password === '') {
            return res.status(400).json({
                status: 'fail',
                message: "please enter the valid password"
            })
        }

        const user = await Auth.findOne({ email: email }) //checking email present in the database

        if (!user) {
            return res.status(404).json({
                status: "fail",
                message: "invalid credentials"
            })
        }
        if (user.is_active === false) {
            return res.status(403).json({
                status: "fail",
                message: "This account has been deactivated."
            });
        }
        // compare passsord

        const match = await user.comparePassword(password, user.password);

        if (!match) {
            return res.status(403).json({
                status: 'Fail',
                message: 'UserName or passward is incorrect'
            })
        }

        const { accessToken: authtoken, refreshToken: refreshtoken } = await createAuthSession(user, req);
        res.status(200).json({
            status: 'success',
            data: {
                student_id: user.student_id,
                authtoken,
                refreshtoken,
                accessToken: authtoken,
                refreshToken: refreshtoken
            }
        })
    } catch (err) {
        res.status(500).json({
            status: 'Fail',
            message: err.message
        })
    }
}

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
