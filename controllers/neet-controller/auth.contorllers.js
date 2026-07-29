const Auth = require('../../model/neet-models/auth');
const { getFirebaseAuth } = require("../../config/firebaseAdmin");
const {
    createAuthSession,
    rotateAuthSession,
    revokeSession,
    revokeAllSessions
} = require('../../services/authToken.service');

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

        if (!user.password) {
            return res.status(403).json({
                status: "fail",
                message: "This account uses Google sign-in."
            });
        }

        const match = await user.comparePassword(password, user.password);

        if (!match) {
            return res.status(403).json({
                status: 'Fail',
                message: 'UserName or passward is incorrect'
            })
        }

        const { accessToken, refreshToken } = await createAuthSession(user, req);
        res.status(200).json({
            status: 'success',
            data: {
                student_id: user.student_id,
                accessToken,
                refreshToken
            }
        })
    } catch (err) {
        res.status(500).json({
            status: 'Fail',
            message: err.message
        })
    }
}

const safeName = (value, fallback) => {
    const lettersOnly = String(value || "").replace(/[^a-zA-Z]/g, "");
    return lettersOnly || fallback;
};

const firebaseConfigurationErrors = new Set([
    "app/invalid-credential",
    "app/invalid-options",
    "auth/invalid-credential"
]);

exports.googleLogin = async (req, res) => {
    try {
        const idToken = typeof req.body.idToken === "string" ? req.body.idToken.trim() : "";
        if (!idToken) {
            return res.status(400).json({ status: "fail", message: "idToken is required." });
        }

        const decoded = await getFirebaseAuth().verifyIdToken(idToken, true);
        if (decoded.firebase?.sign_in_provider !== "google.com") {
            return res.status(401).json({ status: "fail", message: "This endpoint accepts Google sign-in tokens only." });
        }
        if (!decoded.email || decoded.email_verified !== true) {
            return res.status(401).json({ status: "fail", message: "Google must provide a verified email address." });
        }

        const email = decoded.email.trim().toLowerCase();
        let user = await Auth.findOne({
            $or: [{ firebase_uid: decoded.uid }, { email }]
        });

        if (user && user.is_active === false) {
            return res.status(403).json({ status: "fail", message: "This account has been deactivated." });
        }

        const displayParts = String(decoded.name || "").trim().split(/\s+/).filter(Boolean);
        const firstName = safeName(displayParts.shift(), "google");
        const lastName = safeName(displayParts.join(" "), "user");
        let isNewUser = false;

        if (!user) {
            user = await Auth.create({
                firstName,
                lastName,
                email,
                firebase_uid: decoded.uid,
                auth_providers: ["google"],
                profile_picture: decoded.picture
            });
            isNewUser = true;
        } else {
            if (user.firebase_uid && user.firebase_uid !== decoded.uid) {
                return res.status(409).json({ status: "fail", message: "This email is already linked to another Google account." });
            }
            user.firebase_uid = decoded.uid;
            user.auth_providers = [...new Set([...(user.auth_providers || ["password"]), "google"])];
            if (decoded.picture) user.profile_picture = decoded.picture;
            await user.save();
        }

        const { accessToken, refreshToken } = await createAuthSession(user, req);
        return res.status(isNewUser ? 201 : 200).json({
            status: "success",
            message: isNewUser ? "Google account created and logged in." : "Google login successful.",
            data: {
                user: {
                    id: user._id,
                    student_id: user.student_id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phoneNumber: user.phoneNumber || null,
                    profilePicture: user.profile_picture || null,
                    authProviders: user.auth_providers
                },
                accessToken,
                refreshToken,
                isNewUser
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ status: "fail", message: "This Google account or email is already registered." });
        }
        if (firebaseConfigurationErrors.has(error.code)) {
            console.error("Firebase Admin configuration error:", error.message);
            return res.status(503).json({
                status: "fail",
                message: "Google sign-in is temporarily unavailable because the server Firebase configuration is invalid."
            });
        }
        if (String(error.code || "").startsWith("auth/")) {
            return res.status(401).json({ status: "fail", message: "Invalid or expired Google sign-in token." });
        }
        console.error("Google sign-in failed:", error);
        return res.status(500).json({ status: "fail", message: error.message });
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
