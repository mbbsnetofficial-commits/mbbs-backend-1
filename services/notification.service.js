const Notification = require("../model/neet-models/notification");
const Auth = require("../model/neet-models/auth");
const StudentProfile = require("../model/neet-models/studentProfile");

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
    return {
        audience,
        matched_recipients: recipients.length,
        created_count: createdCount,
        unmatched_student_ids: audience === "SELECTED_STUDENTS"
            ? studentIds.filter(id => !matchedStudentIds.has(id))
            : []
    };
};
