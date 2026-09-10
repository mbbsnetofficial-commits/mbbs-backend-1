const Notification = require("../model/neet-models/notification");
const Auth = require("../model/neet-models/auth");
const StudentProfile = require("../model/neet-models/studentProfile");
const DeviceToken = require("../model/neet-models/deviceToken");

const sendPushNotificationToUsers = async ({
    userIds,
    title,
    message,
    notificationType = "GENERAL",
    priority = "normal",
    actionUrl = null,
    data = null
}) => {
    try {
        if (!userIds || !userIds.length) return;

        const deviceTokens = await DeviceToken.find({
            user_id: { $in: userIds },
            is_active: true
        }).select("token").lean();

        if (!deviceTokens || !deviceTokens.length) return;

        const tokens = deviceTokens.map(dt => dt.token).filter(Boolean);
        if (!tokens.length) return;

        const { getFirebaseMessaging } = require("../config/firebaseAdmin");
        const messaging = getFirebaseMessaging();

        const normType = String(notificationType || "GENERAL").toUpperCase();
        const isTest = normType === "TEST" || normType === "RESULT";
        const channelId = isTest ? "mbbs_tests_channel" : "mbbs_general_notifications";
        const isHighPriority = priority === "urgent" || priority === "high" || isTest;

        const chunkSize = 500;
        for (let i = 0; i < tokens.length; i += chunkSize) {
            const batchTokens = tokens.slice(i, i + chunkSize);
            const payload = {
                tokens: batchTokens,
                notification: {
                    title,
                    body: message
                },
                data: {
                    type: normType,
                    title,
                    body: message,
                    action_url: actionUrl ? String(actionUrl) : "",
                    ...(data && typeof data === "object"
                        ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
                        : {})
                },
                android: {
                    priority: isHighPriority ? "high" : "normal",
                    notification: {
                        channelId,
                        icon: "ic_notification",
                        sound: "default"
                    }
                },
                apns: {
                    headers: {
                        "apns-priority": isHighPriority ? "10" : "5"
                    },
                    payload: {
                        aps: {
                            alert: {
                                title,
                                body: message
                            },
                            sound: "default",
                            badge: 1
                        }
                    }
                }
            };

            const response = await messaging.sendEachForMulticast(payload);

            if (response.failureCount > 0) {
                const invalidTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        const code = resp.error?.code;
                        if (
                            code === "messaging/registration-token-not-registered" ||
                            code === "messaging/invalid-registration-token"
                        ) {
                            invalidTokens.push(batchTokens[idx]);
                        }
                    }
                });

                if (invalidTokens.length > 0) {
                    await DeviceToken.updateMany(
                        { token: { $in: invalidTokens } },
                        { $set: { is_active: false } }
                    );
                }
            }
        }
    } catch (pushErr) {
        console.error("⚠️ [Push Notification Error]:", pushErr.message);
    }
};

exports.createNotificationService = async ({
    userId,
    studentId,
    title,
    message,
    notificationType = "system",
    priority = "normal",
    actionUrl = null,
    data = null
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

    sendPushNotificationToUsers({
        userIds: [userId],
        title,
        message,
        notificationType,
        priority,
        actionUrl,
        data
    }).catch(() => {});

    return notification;
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
    audience,
    studentIds = [],
    batch,
    course,
    year,
    title,
    message,
    notificationType,
    priority,
    actionUrl,
    data
}) => {
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
        message,
        notification_type: notificationType,
        priority,
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

    const matchedStudentIds = new Set(recipients.map(user => user.student_id));

    // Dispatch FCM push notifications to all recipients
    sendPushNotificationToUsers({
        userIds: recipients.map(u => u._id),
        title,
        message,
        notificationType,
        priority,
        actionUrl,
        data
    }).catch(() => {});

    return {
        audience,
        matched_recipients: recipients.length,
        created_count: createdCount,
        unmatched_student_ids: audience === "SELECTED_STUDENTS"
            ? studentIds.filter(id => !matchedStudentIds.has(id))
            : []
    };
};
