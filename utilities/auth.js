const jwt = require("jsonwebtoken");
const Auth = require("../model/neet-models/auth");
const AuthSession = require("../model/neet-models/authSession");

exports.protect = async (req, res, next) => {
    try {

        // Check Authorization Header
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        // Token Missing
        if (!token) {
            return res.status(401).json({
                status: "fail",
                message: "Please login to access this resource."
            });
        }

        // Verify Token
        const decoded = jwt.verify(
            token,
            process.env.SECRET_KEY
        );

        const user = await Auth.findById(decoded.id)
            .select("student_id token_version is_active")
            .lean();

        if (!user || user.is_active === false || (decoded.token_version ?? 0) !== (user.token_version ?? 0)) {
            return res.status(401).json({
                status: "fail",
                message: "Your session has expired. Please login again."
            });
        }

        if (decoded.session_id) {
            const activeSession = await AuthSession.exists({
                _id: decoded.session_id,
                user_id: decoded.id,
                is_revoked: false,
                expires_at: { $gt: new Date() }
            });
            if (!activeSession) {
                return res.status(401).json({
                    status: "fail",
                    message: "Your session has expired. Please login again."
                });
            }
        }

        // Save User Details
        req.user = {
            ...decoded,
            student_id: user.student_id
        };

        next();

    } catch (error) {

        return res.status(401).json({
            status: "fail",
            message: "Invalid or Expired Token."
        });

    }
};

// Public endpoints can use this to enrich a response for a logged-in student
// without requiring authentication from anonymous visitors.
exports.optionalProtect = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization?.startsWith("Bearer ")) return next();
        const token = authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await Auth.findById(decoded.id)
            .select("student_id token_version is_active")
            .lean();
        if (!user || user.is_active === false ||
            (decoded.token_version ?? 0) !== (user.token_version ?? 0)) {
            return next();
        }
        if (decoded.session_id) {
            const activeSession = await AuthSession.exists({
                _id: decoded.session_id,
                user_id: decoded.id,
                is_revoked: false,
                expires_at: { $gt: new Date() }
            });
            if (!activeSession) return next();
        }
        req.user = { ...decoded, student_id: user.student_id };
        return next();
    } catch {
        return next();
    }
};
