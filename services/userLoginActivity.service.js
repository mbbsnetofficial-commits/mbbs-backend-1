const mongoose = require("mongoose");
const UserActivity = require("../model/neet-models/userActivity");

const clientIp = req => (req.ip || req.socket?.remoteAddress || "unknown")
    .replace(/^::ffff:/, "");

exports.recordSuccessfulLogin = ({ user, sessionId, req }) => UserActivity.create({
    user_id: user._id,
    student_id: user.student_id,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    event_type: "login",
    auth_method: "password",
    login_at: new Date(),
    session_id: sessionId,
    ip_address: clientIp(req),
    user_agent: req.get("user-agent") || "unknown"
});

const positiveInteger = (value, fallback, maximum = Number.MAX_SAFE_INTEGER) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed < 1) return fallback;
    return Math.min(parsed, maximum);
};

const escapedRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.listLoginActivity = async query => {
    const page = positiveInteger(query.page, 1);
    const limit = positiveInteger(query.limit, 20, 100);
    const filter = { event_type: "login" };

    if (query.user_id) {
        if (!mongoose.isValidObjectId(query.user_id)) {
            throw Object.assign(new Error("user_id must be a valid ObjectId."), {
                statusCode: 400
            });
        }
        filter.user_id = new mongoose.Types.ObjectId(query.user_id);
    }
    if (query.student_id) filter.student_id = query.student_id.trim();
    if (query.email) filter.email = query.email.trim().toLowerCase();
    if (query.ip_address) filter.ip_address = query.ip_address.trim();
    if (query.search) {
        const search = new RegExp(escapedRegex(query.search.trim()), "i");
        filter.$or = [
            { email: search },
            { student_id: search },
            { first_name: search },
            { last_name: search },
            { ip_address: search },
            { user_agent: search }
        ];
    }

    const loginAt = {};
    if (query.date_from) {
        const from = new Date(query.date_from);
        if (Number.isNaN(from.getTime())) {
            throw Object.assign(new Error("date_from must be a valid date."), {
                statusCode: 400
            });
        }
        loginAt.$gte = from;
    }
    if (query.date_to) {
        const to = new Date(query.date_to);
        if (Number.isNaN(to.getTime())) {
            throw Object.assign(new Error("date_to must be a valid date."), {
                statusCode: 400
            });
        }
        loginAt.$lte = to;
    }
    if (Object.keys(loginAt).length) filter.login_at = loginAt;

    const [data, total] = await Promise.all([
        UserActivity.find(filter)
            .sort({ login_at: -1, _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        UserActivity.countDocuments(filter)
    ]);

    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data
    };
};
