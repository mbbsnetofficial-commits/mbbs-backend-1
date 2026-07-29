const jwt = require("jsonwebtoken");
const PlatformAdmin = require("../model/neet-models/platformAdmin");
const { getAdminSigningKey } = require("../config/adminAuth");

exports.protectAdmin = async (req, res, next) => {
    try {
        const signingKey = getAdminSigningKey();
        if (!signingKey) {
            return res.status(503).json({
                status: "fail",
                message: "Admin authentication is unavailable because server authentication secrets are not configured."
            });
        }

        const authorization = req.headers.authorization || "";
        const token = authorization.startsWith("Bearer ")
            ? authorization.slice(7).trim()
            : null;

        if (!token) {
            return res.status(401).json({ status: "fail", message: "Admin login is required." });
        }

        const decoded = jwt.verify(
            token,
            signingKey.key,
            { algorithms: ["HS256"] }
        );
        if (
            decoded.role !== "platform_admin" ||
            decoded.token_type !== "admin_access" ||
            !decoded.id ||
            !decoded.jti
        ) {
            return res.status(403).json({ status: "fail", message: "Platform admin access is required." });
        }

        const admin = await PlatformAdmin.findById(decoded.id).lean();
        if (!admin || !admin.is_active || (decoded.token_version ?? 0) !== (admin.token_version ?? 0)) {
            return res.status(401).json({ status: "fail", message: "Admin session is inactive or expired." });
        }

        req.admin = {
            id: admin._id,
            admin_id: admin.id,
            username: admin.username,
            role: "platform_admin"
        };
        return next();
    } catch (error) {
        return res.status(401).json({ status: "fail", message: "Invalid or expired admin token." });
    }
};
