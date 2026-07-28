const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const PlatformAdmin = require("../../model/neet-models/platformAdmin");

exports.loginPlatformAdmin = async (req, res) => {
    try {
        if (!process.env.ADMIN_SECRET_KEY) {
            return res.status(503).json({
                status: "fail",
                message: "Admin authentication is unavailable."
            });
        }
        const username = typeof req.body.username === "string"
            ? req.body.username.trim()
            : "";
        const password = typeof req.body.password === "string"
            ? req.body.password
            : "";

        if (!username || !password) {
            return res.status(400).json({
                status: "fail",
                message: "username and password are required."
            });
        }

        const admin = await PlatformAdmin.findOne({ username })
            .select("+password_hash");

        if (!admin || !admin.is_active) {
            return res.status(401).json({
                status: "fail",
                message: "Invalid admin credentials."
            });
        }

        const passwordMatches = await admin.comparePassword(password);
        if (!passwordMatches) {
            return res.status(401).json({
                status: "fail",
                message: "Invalid admin credentials."
            });
        }

        const token = jwt.sign(
            {
                id: admin._id,
                admin_id: admin.id,
                username: admin.username,
                role: "platform_admin",
                token_type: "admin_access",
                jti: crypto.randomUUID(),
                token_version: admin.token_version || 0
            },
            process.env.ADMIN_SECRET_KEY,
            {
                algorithm: "HS256",
                expiresIn: process.env.ADMIN_LOGIN_EXPIRES || "8h"
            }
        );

        admin.last_login_at = new Date();
        await admin.save();

        return res.status(200).json({
            status: "success",
            data: {
                admin: {
                    id: admin.id,
                    username: admin.username,
                    is_active: admin.is_active
                },
                token
            }
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};
