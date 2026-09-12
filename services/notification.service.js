const Notification = require("../model/neet-models/notification");
const Auth = require("../model/neet-models/auth");
const StudentProfile = require("../model/neet-models/studentProfile");
const DeviceToken = require("../model/neet-models/deviceToken");
const { getFirebaseMessaging, isFirebaseConfigured } = require("../config/firebaseAdmin");

const FCM_MULTICAST_CHUNK_SIZE = 500;
const INVALID_TOKEN_ERROR_CODES = new Set([
    "messaging/invalid-registration-token",
    "messaging/registration-token-not-registered",
    "messaging/invalid-argument",
    "messaging/mismatched-credential"
]);

exports.createNotificationService = async ({
    userId,
    studentId,
    title,
    message,
    notificationType = "system",
    priority = "normal",
    actionUrl = null,
    data = null
}) => Notification.create({
    user_id: userId,
    student_id: studentId,
    title,
    message,
    notification_type: notificationType,
    priority,
    action_url: actionUrl,
    data
});

exports.registerDeviceTokenService = async ({
    userId,
    studentId = null,
    token,
    deviceType = "android",
    deviceId = null,
    appVersion = null
}) => {
    if (!token || typeof token !== "string") {
        throw new Error("Device token is required.");
    }

    const cleanToken = token.trim();
    const cleanDeviceType = ["android", "ios", "web"].includes(String(deviceType).toLowerCase())
        ? String(deviceType).toLowerCase()
        : "android";

    const updated = await DeviceToken.findOneAndUpdate(
        { token: cleanToken },
        {
            $set: {
                user_id: userId,
                student_id: studentId,
                device_type: cleanDeviceType,
                device_id: deviceId ? String(deviceId).trim() : null,
                app_version: appVersion ? String(appVersion).trim() : null,
                is_active: true,
                last_used_at: new Date()
            }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return updated;
};

exports.deactivateDeviceTokenService = async ({ userId, token, deviceId = null }) => {
    const filter = { user_id: userId };
    if (token) {
        filter.token = String(token).trim();
    } else if (deviceId) {
        filter.device_id = String(deviceId).trim();
    }

    const result = await DeviceToken.updateMany(
        filter,
        { $set: { is_active: false, last_used_at: new Date() } }
    );

    return { modifiedCount: result.modifiedCount };
};

const sanitizeDataPayload = data => {
    if (!data || typeof data !== "object") return {};
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
        if (value === null || value === undefined) {
            sanitized[key] = "";
        } else if (typeof value === "object") {
            sanitized[key] = JSON.stringify(value);
        } else {
            sanitized[key] = String(value);
        }
    }
    return sanitized;
};

exports.sendFcmPushToTokens = async ({
    tokens = [],
    title,
    body,
    data = {},
    notificationType = "GENERAL",
    priority = "high",
    channelId = "mbbs_general_notifications",
    sound = "default"
}) => {
    const uniqueTokens = Array.from(new Set(tokens.filter(t => typeof t === "string" && t.trim().length > 0)));
    if (!uniqueTokens.length) {
        return { success: true, total: 0, sentCount: 0, failedCount: 0, deactivatedTokens: [] };
    }

    if (!isFirebaseConfigured()) {
        return {
            success: false,
            message: "Firebase Admin credentials are not configured on the server.",
            total: uniqueTokens.length,
            sentCount: 0,
            failedCount: uniqueTokens.length,
            deactivatedTokens: []
        };
    }

    const messaging = getFirebaseMessaging();
    const stringData = sanitizeDataPayload({
        ...data,
        type: String(notificationType).toUpperCase(),
        title: title || "",
        body: body || ""
    });

    let sentCount = 0;
    let failedCount = 0;
    const invalidTokens = [];

    for (let index = 0; index < uniqueTokens.length; index += FCM_MULTICAST_CHUNK_SIZE) {
        const chunk = uniqueTokens.slice(index, index + FCM_MULTICAST_CHUNK_SIZE);
        const multicastPayload = {
            tokens: chunk,
            notification: {
                title: String(title || "MBBS.net"),
                body: String(body || "")
            },
            data: stringData,
            android: {
                priority: priority === "high" ? "high" : "normal",
                notification: {
                    channelId,
                    sound,
                    defaultSound: true,
                    defaultVibrateTimings: true,
                    clickAction: "MBBS_NOTIFICATION_CLICK"
                }
            }
        };

        try {
            const response = await messaging.sendEachForMulticast(multicastPayload);
            sentCount += response.successCount;
            failedCount += response.failureCount;

            response.responses.forEach((resp, idx) => {
                if (!resp.success && resp.error) {
                    const errorCode = resp.error.code;
                    if (INVALID_TOKEN_ERROR_CODES.has(errorCode)) {
                        invalidTokens.push(chunk[idx]);
                    }
                }
            });
        } catch (chunkError) {
            failedCount += chunk.length;
        }
    }

    if (invalidTokens.length > 0) {
        await DeviceToken.updateMany(
            { token: { $in: invalidTokens } },
            { $set: { is_active: false, last_used_at: new Date() } }
        ).catch(() => {});
    }

    return {
        success: true,
        total: uniqueTokens.length,
        sentCount,
        failedCount,
        deactivatedTokensCount: invalidTokens.length
    };
};

exports.sendNotificationToUser = async (userId, {
    title,
    body,
    message,
    data = {},
    notificationType = "GENERAL",
    priority = "high",
    actionUrl = null,
    saveInApp = true
}) => {
    const textBody = body || message || "";
    const [tokens, user] = await Promise.all([
        DeviceToken.find({ user_id: userId, is_active: true }).distinct("token"),
        Auth.findById(userId).select("student_id").lean()
    ]);

    let inAppNotification = null;
    if (saveInApp && user) {
        inAppNotification = await exports.createNotificationService({
            userId,
            studentId: user.student_id || "STU123456",
            title,
            message: textBody,
            notificationType: String(notificationType).toLowerCase(),
            priority: priority === "high" ? "high" : "normal",
            actionUrl,
            data
        }).catch(() => null);
    }

    const pushResult = await exports.sendFcmPushToTokens({
        tokens,
        title,
        body: textBody,
        data: {
            ...data,
            notification_id: inAppNotification?._id?.toString() || "",
            action_url: actionUrl || ""
        },
        notificationType,
        priority
    });

    return {
        user_id: userId,
        active_tokens_count: tokens.length,
        in_app_notification_id: inAppNotification?._id || null,
        push: pushResult
    };
};

exports.sendNotificationToUsers = async (userIds = [], {
    title,
    body,
    message,
    data = {},
    notificationType = "GENERAL",
    priority = "high",
    actionUrl = null
}) => {
    const textBody = body || message || "";
    const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));
    if (!uniqueUserIds.length) {
        return { success: true, matched_users: 0, sentCount: 0, failedCount: 0 };
    }

    const activeTokens = await DeviceToken.find({
        user_id: { $in: uniqueUserIds },
        is_active: true
    }).distinct("token");

    const pushResult = await exports.sendFcmPushToTokens({
        tokens: activeTokens,
        title,
        body: textBody,
        data: { ...data, action_url: actionUrl || "" },
        notificationType,
        priority
    });

    return {
        success: true,
        matched_users: uniqueUserIds.length,
        tokens_found: activeTokens.length,
        push: pushResult
    };
};

const escapedRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const resolveAudience = async ({ audience, studentIds, batch, course, year }) => {
    const hasStudentId = { student_id: { $type: "string", $ne: "" } };
    if (audience === "ALL_STUDENTS") {
        return Auth.find(hasStudentId).select("_id student_id").lean();
    }
    if (audience === "ACTIVE_STUDENTS") {
        return Auth.find({
            ...hasStudentId,
            is_active: { $ne: false }
        }).select("_id student_id").lean();
    }
    if (audience === "SELECTED_STUDENTS") {
        return Auth.find({ student_id: { $in: studentIds } })
            .select("_id student_id")
            .lean();
    }

    const profileFilter = { is_active: { $ne: false } };
    if (audience === "BATCH") {
        profileFilter.batch = { $regex: `^${escapedRegex(batch)}$`, $options: "i" };
    } else if (audience === "COURSE") {
        profileFilter.course = { $regex: `^${escapedRegex(course)}$`, $options: "i" };
    } else if (audience === "YEAR") {
        profileFilter.target_exam_year = year;
    }

    const profileStudentIds = await StudentProfile.distinct("student_id", profileFilter);
    return Auth.find({
        student_id: { $in: profileStudentIds },
        is_active: { $ne: false }
    }).select("_id student_id").lean();
};

exports.broadcastNotificationService = async ({
    audience = "ALL_STUDENTS",
    studentIds = [],
    batch,
    course,
    year,
    title,
    message,
    body,
    notificationType = "system",
    priority = "normal",
    actionUrl = null,
    data = null,
    sendPush = true
}) => {
    const textBody = message || body || "";
    const recipients = await resolveAudience({
        audience,
        studentIds,
        batch,
        course,
        year
    });
    const createdAt = new Date();
    const documents = recipients.map(user => ({
        user_id: user._id,
        student_id: user.student_id,
        title,
        message: textBody,
        notification_type: String(notificationType).toLowerCase(),
        priority: priority === "high" ? "high" : "normal",
        action_url: actionUrl,
        data,
        created_at: createdAt,
        updated_at: createdAt
    }));

    let createdCount = 0;
    const chunkSize = 1000;
    for (let index = 0; index < documents.length; index += chunkSize) {
        const created = await Notification.insertMany(
            documents.slice(index, index + chunkSize),
            { ordered: false }
        );
        createdCount += created.length;
    }

    let pushResult = null;
    if (sendPush && recipients.length > 0) {
        const recipientUserIds = recipients.map(r => r._id);
        const tokens = await DeviceToken.find({
            user_id: { $in: recipientUserIds },
            is_active: true
        }).distinct("token");

        pushResult = await exports.sendFcmPushToTokens({
            tokens,
            title,
            body: textBody,
            data: { ...(data || {}), action_url: actionUrl || "" },
            notificationType,
            priority
        });
    }

    const matchedStudentIds = new Set(recipients.map(user => user.student_id));
    return {
        audience,
        matched_recipients: recipients.length,
        created_in_app_count: createdCount,
        push: pushResult,
        unmatched_student_ids: audience === "SELECTED_STUDENTS"
            ? studentIds.filter(id => !matchedStudentIds.has(id))
            : []
    };
};
