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
                student_id: studentId || null,
                device_type: cleanDeviceType,
                device_id: deviceId ? String(deviceId).trim() : null,
                app_version: appVersion ? String(appVersion).trim() : null,
                is_active: true,
                last_used_at: new Date()
            }
        },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
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

exports.sendFcmPushToTokens = async ({
    tokens = [],
    title,
    body,
    message,
    data = {},
    notificationType = "GENERAL",
    priority = "high",
    channelId = "mbbs_general_notifications",
    sound = "default"
}) => {
    const textBody = body || message || "";
    const textTitle = title || "MBBS.net";
    const uniqueTokens = Array.from(new Set(tokens.filter(t => typeof t === "string" && t.trim().length > 0)));
    if (!uniqueTokens.length) {
        return { success: true, total: 0, sentCount: 0, failedCount: 0, deactivatedTokensCount: 0 };
    }

    if (!isFirebaseConfigured()) {
        console.warn("⚠️ [Push Notification Warning]: Firebase Admin credentials are not configured on the server.");
        return {
            success: false,
            message: "Firebase Admin credentials are not configured on the server.",
            total: uniqueTokens.length,
            sentCount: 0,
            failedCount: uniqueTokens.length,
            deactivatedTokensCount: 0
        };
    }

    const messaging = getFirebaseMessaging();
    const normType = String(notificationType || "GENERAL").toUpperCase();
    const isTest = normType === "TEST" || normType === "RESULT";
    const resolvedChannelId = isTest ? "mbbs_tests_channel" : channelId;
    const isHighPriority = priority === "urgent" || priority === "high" || isTest;

    const stringData = sanitizeDataPayload({
        ...data,
        type: normType,
        title: String(textTitle),
        body: String(textBody)
    });

    let sentCount = 0;
    let failedCount = 0;
    const invalidTokens = [];

    for (let index = 0; index < uniqueTokens.length; index += FCM_MULTICAST_CHUNK_SIZE) {
        const chunk = uniqueTokens.slice(index, index + FCM_MULTICAST_CHUNK_SIZE);
        const multicastPayload = {
            tokens: chunk,
            notification: {
                title: String(textTitle),
                body: String(textBody)
            },
            data: stringData,
            android: {
                priority: isHighPriority ? "high" : "normal",
                notification: {
                    channelId: resolvedChannelId,
                    icon: "ic_notification",
                    sound: sound || "default",
                    defaultSound: true,
                    defaultVibrateTimings: true,
                    clickAction: "MBBS_NOTIFICATION_CLICK"
                }
            },
            apns: {
                headers: {
                    "apns-priority": isHighPriority ? "10" : "5"
                },
                payload: {
                    aps: {
                        alert: {
                            title: String(textTitle),
                            body: String(textBody)
                        },
                        sound: sound || "default",
                        badge: 1
                    }
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
            console.error("⚠️ [FCM Multicast Error]:", chunkError.message);
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

exports.sendPushNotificationToUsers = async ({
    userIds = [],
    title,
    message,
    body,
    notificationType = "GENERAL",
    priority = "normal",
    actionUrl = null,
    data = {}
}) => {
    return exports.sendNotificationToUsers(userIds, {
        title,
        body: body || message,
        data,
        notificationType,
        priority: priority === "urgent" || priority === "high" ? "high" : "normal",
        actionUrl
    });
};

exports.createNotificationService = async ({
    userId,
    studentId,
    title,
    message,
    notificationType = "system",
    priority = "normal",
    actionUrl = null,
    data = null,
    sendPush = true
}) => {
    const notification = await Notification.create({
        user_id: userId,
        student_id: studentId,
        title,
        message,
        notification_type: notificationType,
        priority,
        action_url: actionUrl,
        data
    });

    if (sendPush) {
        exports.sendPushNotificationToUsers({
            userIds: [userId],
            title,
            message,
            notificationType,
            priority,
            actionUrl,
            data
        }).catch(pushErr => {
            console.error("⚠️ [Push Notification Error]:", pushErr.message);
        });
    }

    return notification;
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
    const user = await Auth.findById(userId).select("student_id").lean();

    let inAppNotification = null;
    if (saveInApp && user) {
        inAppNotification = await exports.createNotificationService({
            userId,
            studentId: user.student_id || null,
            title,
            message: textBody,
            notificationType: String(notificationType).toLowerCase(),
            priority: priority === "high" || priority === "urgent" ? "high" : "normal",
            actionUrl,
            data,
            sendPush: false
        }).catch(() => null);
    }

    const tokenQuery = {
        $or: [
            { user_id: userId }
        ],
        is_active: true
    };
    if (user?.student_id) {
        tokenQuery.$or.push({ student_id: user.student_id });
    }

    const tokens = await DeviceToken.find(tokenQuery).distinct("token");

    const pushResult = await exports.sendFcmPushToTokens({
        tokens,
        title,
        body: textBody,
        data: {
            ...(data || {}),
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

    const users = await Auth.find({ _id: { $in: uniqueUserIds } }).select("_id student_id").lean();
    const userObjectIds = users.map(u => u._id);
    const studentIds = users.map(u => u.student_id).filter(Boolean);

    const activeTokens = await DeviceToken.find({
        $or: [
            { user_id: { $in: userObjectIds.length ? userObjectIds : uniqueUserIds } },
            ...(studentIds.length ? [{ student_id: { $in: studentIds } }] : [])
        ],
        is_active: true
    }).distinct("token");

    const pushResult = await exports.sendFcmPushToTokens({
        tokens: activeTokens,
        title,
        body: textBody,
        data: { ...(data || {}), action_url: actionUrl || "" },
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
        priority: priority === "high" || priority === "urgent" ? "high" : "normal",
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
        const recipientStudentIds = recipients.map(r => r.student_id).filter(Boolean);

        const tokens = await DeviceToken.find({
            $or: [
                { user_id: { $in: recipientUserIds } },
                ...(recipientStudentIds.length ? [{ student_id: { $in: recipientStudentIds } }] : [])
            ],
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
