const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const AuthSession = require("../model/neet-models/authSession");

const hashToken = token => crypto.createHash("sha256").update(token).digest("hex");

const clientIp = req => (req.ip || req.socket?.remoteAddress || "unknown")
    .replace(/^::ffff:/, "");

const signTokens = (user, sessionId, refreshJti) => {
    const commonPayload = {
        id: user._id,
        student_id: user.student_id,
        token_version: user.token_version || 0,
        session_id: sessionId
    };
    const accessToken = jwt.sign(
        { ...commonPayload, token_type: "access", jti: crypto.randomUUID() },
        process.env.SECRET_KEY,
        { expiresIn: process.env.LOGIN_EXPIRES || "1h" }
    );
    const refreshToken = jwt.sign(
        { ...commonPayload, token_type: "refresh", jti: refreshJti },
        process.env.REFRESH_SECRET_KEY,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "30d" }
    );
    return { accessToken, refreshToken };
};

exports.createAuthSession = async (user, req) => {
    const sessionId = new mongoose.Types.ObjectId();
    const refreshJti = crypto.randomUUID();
    const tokens = signTokens(user, sessionId, refreshJti);
    const decodedRefresh = jwt.decode(tokens.refreshToken);

    await AuthSession.create({
        _id: sessionId,
        user_id: user._id,
        refresh_jti: refreshJti,
        refresh_token_hash: hashToken(tokens.refreshToken),
        user_agent: req.get("user-agent") || "unknown",
        ip_address: clientIp(req),
        expires_at: new Date(decodedRefresh.exp * 1000)
    });
    return tokens;
};

exports.rotateAuthSession = async (refreshToken, req) => {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
    if (decoded.token_type !== "refresh" || !decoded.session_id || !decoded.jti) {
        throw Object.assign(new Error("Invalid refresh token."), { statusCode: 401 });
    }

    const session = await AuthSession.findOne({
        _id: decoded.session_id,
        user_id: decoded.id,
        refresh_jti: decoded.jti,
        is_revoked: false,
        expires_at: { $gt: new Date() }
    }).select("+refresh_token_hash");

    if (!session || session.refresh_token_hash !== hashToken(refreshToken)) {
        throw Object.assign(new Error("Refresh token is invalid, expired, or revoked."), { statusCode: 401 });
    }

    const Auth = require("../model/neet-models/auth");
    const user = await Auth.findById(decoded.id);
    if (!user || user.is_active === false || (decoded.token_version ?? 0) !== (user.token_version ?? 0)) {
        throw Object.assign(new Error("User session has expired. Please login again."), { statusCode: 401 });
    }

    const nextJti = crypto.randomUUID();
    const tokens = signTokens(user, session._id, nextJti);
    const nextDecoded = jwt.decode(tokens.refreshToken);
    session.refresh_jti = nextJti;
    session.refresh_token_hash = hashToken(tokens.refreshToken);
    session.last_used_at = new Date();
    session.user_agent = req.get("user-agent") || session.user_agent;
    session.ip_address = clientIp(req);
    session.expires_at = new Date(nextDecoded.exp * 1000);
    await session.save();

    return tokens;
};

exports.revokeSession = sessionId => AuthSession.findOneAndUpdate(
    { _id: sessionId, is_revoked: false },
    { $set: { is_revoked: true, revoked_at: new Date() } },
    { returnDocument: "after" }
);

exports.revokeAllSessions = userId => AuthSession.updateMany(
    { user_id: userId, is_revoked: false },
    { $set: { is_revoked: true, revoked_at: new Date() } }
);
