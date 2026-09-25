const mongoose = require("mongoose");
const Notification = require("../model/neet-models/notification");
const Auth = require("../model/neet-models/auth");
const StudentProfile = require("../model/neet-models/studentProfile");
const DeviceToken = require("../model/neet-models/deviceToken");
const TestSession = require("../model/neet-models/testSession");
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
    const isTest = normType === "TEST" || normType === "RESULT" || normType === "TEST_INCOMPLETE";
    const resolvedChannelId = isTest ? "mbbs_tests_channel" : channelId;
    const isHighPriority = priority === "urgent" || priority === "high" || isTest;

    const stringData = sanitizeDataPayload({
        ...(data || {}),
        type: normType,
        title: String(textTitle),
        body: String(textBody),
        message: String(textBody),
        notification_type: normType,
        click_action: "FLUTTER_NOTIFICATION_CLICK"
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
                priority: "high",
                notification: {
                    channelId: resolvedChannelId,
                    icon: "ic_notification",
                    color: "#0A2B2A",
                    sound: sound || "default",
                    defaultSound: true,
                    defaultVibrateTimings: true,
                    priority: "PRIORITY_HIGH",
                    visibility: "PUBLIC",
                    clickAction: "FLUTTER_NOTIFICATION_CLICK"
                }
            },
            apns: {
                headers: {
                    "apns-priority": isHighPriority ? "10" : "5",
                    "apns-push-type": "alert",
                    "apns-topic": "com.mbbs.Mbbs"
                },
                payload: {
                    aps: {
                        alert: {
                            title: String(textTitle),
                            body: String(textBody)
                        },
                        sound: sound || "default",
                        badge: 1,
                        contentAvailable: true,
                        mutableContent: true
                    },
                    ...stringData
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
                    console.warn(`⚠️ [FCM Token Response ${chunk[idx].slice(0, 15)}...]:`, errorCode, resp.error.message);
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

exports.sendDirectPushToSingleToken = async ({
    token,
    title = "MBBS.net Alert",
    body = "Test push notification",
    data = {},
    sound = "default"
}) => {
    if (!token || typeof token !== "string" || !token.trim()) {
        throw new Error("Device token is required.");
    }
    if (!isFirebaseConfigured()) {
        throw new Error("Firebase Admin credentials are not configured on the server.");
    }

    const messaging = getFirebaseMessaging();
    const stringData = sanitizeDataPayload({
        ...(data || {}),
        title: String(title),
        body: String(body),
        click_action: "FLUTTER_NOTIFICATION_CLICK"
    });

    const message = {
        token: token.trim(),
        notification: {
            title: String(title),
            body: String(body)
        },
        data: stringData,
        android: {
            priority: "high",
            notification: {
                channelId: "mbbs_general_notifications",
                icon: "ic_notification",
                color: "#0A2B2A",
                sound: sound || "default",
                defaultSound: true,
                defaultVibrateTimings: true,
                clickAction: "FLUTTER_NOTIFICATION_CLICK"
            }
        },
        apns: {
            headers: {
                "apns-priority": "10",
                "apns-push-type": "alert",
                "apns-topic": "com.mbbs.Mbbs"
            },
            payload: {
                aps: {
                    alert: {
                        title: String(title),
                        body: String(body)
                    },
                    sound: sound || "default",
                    badge: 1,
                    contentAvailable: true,
                    mutableContent: true
                },
                ...stringData
            }
        }
    };

    const response = await messaging.send(message);
    return { success: true, messageId: response, token: token.trim() };
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
    const normAudience = String(audience || "ALL_STUDENTS").trim().toUpperCase();
    if (normAudience === "ALL_STUDENTS" || normAudience === "ALL") {
        return Auth.find({}).select("_id student_id").lean();
    }
    if (normAudience === "ACTIVE_STUDENTS") {
        return Auth.find({
            is_active: { $ne: false }
        }).select("_id student_id").lean();
    }
    if (normAudience === "SELECTED_STUDENTS") {
        return Auth.find({
            $or: [
                { student_id: { $in: studentIds } },
                { _id: { $in: studentIds.filter(id => mongoose.isValidObjectId(id)) } }
            ]
        }).select("_id student_id").lean();
    }

    const profileFilter = { is_active: { $ne: false } };
    if (normAudience === "BATCH") {
        profileFilter.batch = { $regex: `^${escapedRegex(batch)}$`, $options: "i" };
    } else if (normAudience === "COURSE") {
        profileFilter.course = { $regex: `^${escapedRegex(course)}$`, $options: "i" };
    } else if (normAudience === "YEAR") {
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
    const normAudience = String(audience || "ALL_STUDENTS").trim().toUpperCase();
    const textBody = message || body || "";
    const textTitle = title || "MBBS.net";
    const recipients = await resolveAudience({
        audience: normAudience,
        studentIds,
        batch,
        course,
        year
    });
    const createdAt = new Date();
    const documents = recipients.map(user => ({
        user_id: user._id,
        student_id: user.student_id || null,
        title: textTitle,
        message: textBody,
        notification_type: String(notificationType).toLowerCase(),
        priority: priority === "high" || priority === "urgent" ? "high" : "normal",
        action_url: actionUrl,
        data,
        created_at: createdAt,
        updated_at: createdAt
    }));

    let createdCount = 0;
    if (documents.length > 0) {
        const chunkSize = 1000;
        for (let index = 0; index < documents.length; index += chunkSize) {
            const created = await Notification.insertMany(
                documents.slice(index, index + chunkSize),
                { ordered: false }
            );
            createdCount += created.length;
        }
    }

    let pushResult = null;
    if (sendPush) {
        let tokens = [];
        if (normAudience === "ALL_STUDENTS" || normAudience === "ALL") {
            tokens = await DeviceToken.find({ is_active: true }).distinct("token");
        } else if (recipients.length > 0) {
            const recipientUserIds = recipients.map(r => r._id);
            const recipientStudentIds = recipients.map(r => r.student_id).filter(Boolean);

            tokens = await DeviceToken.find({
                $or: [
                    { user_id: { $in: recipientUserIds } },
                    ...(recipientStudentIds.length ? [{ student_id: { $in: recipientStudentIds } }] : [])
                ],
                is_active: true
            }).distinct("token");
        }

        if (tokens.length > 0) {
            pushResult = await exports.sendFcmPushToTokens({
                tokens,
                title: textTitle,
                body: textBody,
                data: { ...(data || {}), action_url: actionUrl || "" },
                notificationType,
                priority
            });
        }
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

/**
 * Automated push notification when a user leaves a test session incomplete.
 */
exports.sendIncompleteTestNotificationService = async ({
    sessionId,
    userId,
    studentId,
    testType = "Test"
}) => {
    let targetUser = null;
    let targetStudentId = studentId || null;

    if (userId) {
        targetUser = await Auth.findById(userId).select("_id student_id").lean();
    } else if (studentId) {
        targetUser = await Auth.findOne({ student_id: studentId }).select("_id student_id").lean();
    } else if (sessionId) {
        let session = null;
        if (mongoose.isValidObjectId(sessionId)) {
            session = await TestSession.findById(sessionId).lean();
        }
        if (session) {
            targetStudentId = session.student_id;
            targetUser = await Auth.findOne({ student_id: session.student_id }).select("_id student_id").lean();
            testType = session.test_type || testType;
        }
    }

    if (!targetUser) {
        throw new Error("Target user could not be found for incomplete test notification.");
    }

    const title = "📝 You have an unfinished test!";
    const body = `You left your ${testType} session incomplete. Tap here to resume and finish your test now!`;
    const actionUrl = sessionId ? `/tests/resume/${sessionId}` : "/tests/active";

    const result = await exports.sendNotificationToUser(targetUser._id, {
        title,
        body,
        notificationType: "reminder",
        priority: "high",
        actionUrl,
        data: {
            type: "TEST_INCOMPLETE",
            test_type: String(testType),
            session_id: String(sessionId || ""),
            action_url: actionUrl
        },
        saveInApp: true
    });

    return {
        success: true,
        user_id: targetUser._id,
        student_id: targetUser.student_id,
        session_id: sessionId || null,
        push: result.push
    };
};

/**
 * Automated push notification when a student receives an invitation from a university.
 */
exports.sendUniversityInviteNotificationService = async ({
    userId,
    studentId,
    email,
    phoneNumber,
    universityName,
    programName = null,
    inviteId = null,
    actionUrl = null,
    customMessage = null,
    expiryDate = null,
    data = {}
}) => {
    if (!universityName || typeof universityName !== "string" || !universityName.trim()) {
        throw new Error("university_name is required for university invite notification.");
    }

    const cleanUnivName = universityName.trim();
    let targetUser = null;

    if (userId && mongoose.isValidObjectId(userId)) {
        targetUser = await Auth.findById(userId).select("_id student_id").lean();
    } else if (studentId) {
        const cleanId = String(studentId).trim();
        targetUser = await Auth.findOne({ student_id: cleanId }).select("_id student_id").lean();
        if (!targetUser) {
            const profile = await StudentProfile.findOne({ student_id: cleanId }).lean();
            if (profile) {
                targetUser = await Auth.findOne({
                    $or: [
                        { student_id: profile.student_id },
                        ...(profile.email ? [{ email: profile.email.toLowerCase() }] : []),
                        ...(profile.phone_number ? [{ phoneNumber: profile.phone_number }] : [])
                    ]
                }).select("_id student_id").lean();
            }
        }
    } else if (email) {
        const cleanEmail = String(email).trim().toLowerCase();
        targetUser = await Auth.findOne({ email: cleanEmail }).select("_id student_id").lean();
        if (!targetUser) {
            const profile = await StudentProfile.findOne({ email: cleanEmail }).lean();
            if (profile) {
                targetUser = await Auth.findOne({
                    $or: [
                        ...(profile.student_id ? [{ student_id: profile.student_id }] : []),
                        ...(profile.phone_number ? [{ phoneNumber: profile.phone_number }] : [])
                    ]
                }).select("_id student_id").lean();
            }
        }
    } else if (phoneNumber) {
        const cleanPhone = String(phoneNumber).trim();
        targetUser = await Auth.findOne({ phoneNumber: cleanPhone }).select("_id student_id").lean();
        if (!targetUser) {
            const profile = await StudentProfile.findOne({ phone_number: cleanPhone }).lean();
            if (profile) {
                targetUser = await Auth.findOne({
                    $or: [
                        ...(profile.student_id ? [{ student_id: profile.student_id }] : []),
                        ...(profile.email ? [{ email: profile.email.toLowerCase() }] : [])
                    ]
                }).select("_id student_id").lean();
            }
        }
    }

    if (!targetUser) {
        throw new Error("Recipient student could not be located by the provided identifier (userId, studentId, email, or phoneNumber).");
    }

    const title = `🎓 New Invitation from ${cleanUnivName}`;
    const programText = programName ? ` for the ${programName} program` : "";
    const body = customMessage
        ? String(customMessage).trim()
        : `${cleanUnivName} has sent you an exclusive admission invitation${programText}! Tap here to view and respond.`;

    const resolvedActionUrl = actionUrl || (inviteId ? `/invites/${inviteId}` : "/invites");

    const result = await exports.sendNotificationToUser(targetUser._id, {
        title,
        body,
        notificationType: "university_invite",
        priority: "high",
        actionUrl: resolvedActionUrl,
        data: {
            type: "UNIVERSITY_INVITE",
            university_name: cleanUnivName,
            program_name: programName || "",
            invite_id: inviteId || "",
            expiry_date: expiryDate ? String(expiryDate) : "",
            action_url: resolvedActionUrl,
            ...data
        },
        saveInApp: true
    });

    return {
        success: true,
        user_id: targetUser._id,
        student_id: targetUser.student_id,
        university_name: cleanUnivName,
        program_name: programName || null,
        invite_id: inviteId || null,
        push: result.push
    };
};

/**
 * Background scanner to detect incomplete/abandoned test sessions and send automated push notifications.
 */
exports.checkIncompleteTestSessionsAndNotifyService = async ({ inactivityMinutes = 5 } = {}) => {
    const cutoffTime = new Date(Date.now() - inactivityMinutes * 60 * 1000);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find sessions started more than `inactivityMinutes` ago, but less than 24h ago, still marked "Started"
    const incompleteSessions = await TestSession.find({
        status: "Started",
        started_at: { $lte: cutoffTime, $gte: dayAgo }
    }).limit(100).lean();

    const results = [];
    for (const session of incompleteSessions) {
        try {
            // Check if reminder was already sent in the last 6 hours
            const recentReminder = await Notification.findOne({
                student_id: session.student_id,
                notification_type: "reminder",
                "data.session_id": String(session._id),
                created_at: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) }
            }).lean();

            if (!recentReminder) {
                const sendRes = await exports.sendIncompleteTestNotificationService({
                    sessionId: session._id,
                    studentId: session.student_id,
                    testType: session.test_type || "Test"
                });
                results.push({ sessionId: session._id, success: true, push: sendRes.push });
            }
        } catch (err) {
            results.push({ sessionId: session._id, success: false, error: err.message });
        }
    }

    return {
        scanned: incompleteSessions.length,
        reminders_sent: results.filter(r => r.success).length,
        results
    };
};
