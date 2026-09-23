"use strict";

const mongoose = require("mongoose");
const Auth = require("../model/neet-models/auth");
const StudentProfile = require("../model/neet-models/studentProfile");
const AuthSession = require("../model/neet-models/authSession");
const DeviceToken = require("../model/neet-models/deviceToken");
const ChatSession = require("../model/neet-models/chatSession");
const ChatMessage = require("../model/neet-models/chatMessage");
const Notification = require("../model/neet-models/notification");
const UserActivity = require("../model/neet-models/userActivity");
const StudentActivity = require("../model/neet-models/studentActivity");
const BlogLike = require("../model/neet-models/blogLike");
const BlogSave = require("../model/neet-models/blogSave");
const AuthorFollow = require("../model/neet-models/authorFollow");
const ReviewComment = require("../model/neet-models/reviewComment");
const QuestionFeedback = require("../model/neet-models/questionFeedback");
const TestSession = require("../model/neet-models/testSession");
const PlatformTest = require("../model/neet-models/platformTest");
const TestSubjectZoneInsight = require("../model/neet-models/testSubjectZoneInsight");
const PasswordReset = require("../model/neet-models/passwordReset");
const PasswordSetupToken = require("../model/neet-models/passwordSetupToken");
const SignupOtp = require("../model/neet-models/signupOtp");
const { getFirebaseAuth, isFirebaseConfigured } = require("../config/firebaseAdmin");

const phoneVariants = (phone) => {
    if (!phone) return [];
    const cleaned = String(phone).trim().replace(/[\s()-]/g, "");
    const last10 = cleaned.slice(-10);
    return [...new Set([cleaned, phone, last10, `+91${last10}`, `91${last10}`])].filter(Boolean);
};

/**
 * Permanently deletes a user account and purges all associated data across collections.
 * @param {string|mongoose.Types.ObjectId} userId - The _id of the Auth user document.
 * @param {Object} [options] - Additional options such as reason.
 * @returns {Promise<Object>} Summary of deleted records.
 */
exports.permanentlyDeleteUserAccount = async (userId, options = {}) => {
    const user = await Auth.findById(userId);
    if (!user) {
        return null;
    }

    const studentId = user.student_id;
    const phoneNumber = user.phoneNumber;
    const email = user.email;
    const firebaseUid = user.firebase_uid;
    const phones = phoneVariants(phoneNumber);

    const deletionSummary = {
        userId: user._id.toString(),
        studentId: studentId || null,
        phoneNumber: phoneNumber || null,
        email: email || null,
        deletedCollections: {}
    };

    // 1. Auth Sessions
    const authSessionsResult = await AuthSession.deleteMany({ user_id: user._id });
    deletionSummary.deletedCollections.authSessions = authSessionsResult.deletedCount || 0;

    // 2. Device Push Tokens
    const deviceTokenQuery = [{ user_id: user._id }];
    if (studentId) deviceTokenQuery.push({ student_id: studentId });
    const deviceTokensResult = await DeviceToken.deleteMany({ $or: deviceTokenQuery });
    deletionSummary.deletedCollections.deviceTokens = deviceTokensResult.deletedCount || 0;

    // 3. NEET Chat Sessions and Messages
    const chatSessions = await ChatSession.find({ user_id: user._id }).select("_id").lean();
    const chatSessionIds = chatSessions.map(s => s._id);
    if (chatSessionIds.length > 0) {
        const chatMessagesResult = await ChatMessage.deleteMany({ session_id: { $in: chatSessionIds } });
        deletionSummary.deletedCollections.chatMessages = chatMessagesResult.deletedCount || 0;
    }
    const chatSessionsResult = await ChatSession.deleteMany({ user_id: user._id });
    deletionSummary.deletedCollections.chatSessions = chatSessionsResult.deletedCount || 0;

    // 4. Notifications
    const notificationQuery = [{ user_id: user._id }];
    if (studentId) notificationQuery.push({ student_id: studentId });
    const notificationsResult = await Notification.deleteMany({ $or: notificationQuery });
    deletionSummary.deletedCollections.notifications = notificationsResult.deletedCount || 0;

    // 5. User Activity Logs
    const userActivityQuery = [{ user_id: user._id }];
    if (studentId) userActivityQuery.push({ student_id: studentId });
    const userActivityResult = await UserActivity.deleteMany({ $or: userActivityQuery });
    deletionSummary.deletedCollections.userActivity = userActivityResult.deletedCount || 0;

    // 6. Student Profile
    const studentProfileQuery = [{ _id: user._id }];
    if (studentId) studentProfileQuery.push({ student_id: studentId });
    if (phones.length > 0) studentProfileQuery.push({ phone_number: { $in: phones } });
    if (email) studentProfileQuery.push({ email });
    const studentProfileResult = await StudentProfile.deleteMany({ $or: studentProfileQuery });
    deletionSummary.deletedCollections.studentProfile = studentProfileResult.deletedCount || 0;

    // 7. Student-specific data (Test Sessions, Platform Tests, Activities, Insights)
    if (studentId) {
        const [
            studentActivityRes,
            blogLikesRes,
            blogSavesRes,
            authorFollowsRes,
            reviewCommentsRes,
            questionFeedbackRes,
            testSessionsRes,
            platformTestsRes,
            zoneInsightsRes
        ] = await Promise.all([
            StudentActivity.deleteMany({ student_id: studentId }),
            BlogLike.deleteMany({ $or: [{ user_id: user._id }, { student_id: studentId }] }),
            BlogSave.deleteMany({ $or: [{ user_id: user._id }, { student_id: studentId }] }),
            AuthorFollow.deleteMany({ $or: [{ user_id: user._id }, { student_id: studentId }] }),
            ReviewComment.deleteMany({ $or: [{ user_id: user._id }, { student_id: studentId }] }),
            QuestionFeedback.deleteMany({ student_id: studentId }),
            TestSession.deleteMany({ student_id: studentId }),
            PlatformTest.deleteMany({ student_id: studentId }),
            TestSubjectZoneInsight.deleteMany({ student_id: studentId })
        ]);

        deletionSummary.deletedCollections.studentActivity = studentActivityRes.deletedCount || 0;
        deletionSummary.deletedCollections.blogLikes = blogLikesRes.deletedCount || 0;
        deletionSummary.deletedCollections.blogSaves = blogSavesRes.deletedCount || 0;
        deletionSummary.deletedCollections.authorFollows = authorFollowsRes.deletedCount || 0;
        deletionSummary.deletedCollections.reviewComments = reviewCommentsRes.deletedCount || 0;
        deletionSummary.deletedCollections.questionFeedback = questionFeedbackRes.deletedCount || 0;
        deletionSummary.deletedCollections.testSessions = testSessionsRes.deletedCount || 0;
        deletionSummary.deletedCollections.platformTests = platformTestsRes.deletedCount || 0;
        deletionSummary.deletedCollections.testSubjectZoneInsights = zoneInsightsRes.deletedCount || 0;
    }

    // 8. OTPs and Password Reset Tokens
    if (phones.length > 0) {
        const signupOtpRes = await SignupOtp.deleteMany({ phone_number: { $in: phones } });
        deletionSummary.deletedCollections.signupOtp = signupOtpRes.deletedCount || 0;
    }
    const passwordResetQuery = [{ user_id: user._id }];
    if (phones.length > 0) passwordResetQuery.push({ phone_number: { $in: phones } });
    if (email) passwordResetQuery.push({ email });
    const passwordResetRes = await PasswordReset.deleteMany({ $or: passwordResetQuery });
    deletionSummary.deletedCollections.passwordReset = passwordResetRes.deletedCount || 0;

    const passwordSetupTokenRes = await PasswordSetupToken.deleteMany({ user_id: user._id });
    deletionSummary.deletedCollections.passwordSetupToken = passwordSetupTokenRes.deletedCount || 0;

    // 9. Optional UCAT collections cleanup
    try {
        const UcatTestSession = require("../model/ucat-model/ucatTestSession");
        const UcatPlatformTest = require("../model/ucat-model/ucatPlatformTest");
        const UcatChatSession = require("../model/ucat-model/ucatChatSession");
        const UcatChatMessage = require("../model/ucat-model/ucatChatMessage");
        const UcatZoneInsight = require("../model/ucat-model/ucatZoneInsight");

        if (studentId) {
            await Promise.all([
                UcatTestSession.deleteMany({ student_id: studentId }),
                UcatPlatformTest.deleteMany({ student_id: studentId }),
                UcatZoneInsight.deleteMany({ student_id: studentId })
            ]);
        }
        const ucatSessions = await UcatChatSession.find({ user_id: user._id }).select("_id").lean();
        if (ucatSessions.length > 0) {
            await UcatChatMessage.deleteMany({ session_id: { $in: ucatSessions.map(s => s._id) } });
        }
        await UcatChatSession.deleteMany({ user_id: user._id });
    } catch {
        // Ignored if UCAT collections are uninitialized
    }

    // 10. Optional Blog Comments cleanup
    try {
        const BlogComment = require("../model/blog-model/blogComment.model");
        const BlogCommentLike = require("../model/blog-model/blogCommentLike.model");
        const commentQuery = [{ studentId: user._id }];
        if (studentId) commentQuery.push({ student_id: studentId });
        await BlogComment.deleteMany({ $or: commentQuery });
        await BlogCommentLike.deleteMany({ studentId: user._id });
    } catch {
        // Ignored if Blog connection is uninitialized
    }

    // 11. Firebase Auth user deletion
    if (firebaseUid && isFirebaseConfigured()) {
        try {
            await getFirebaseAuth().deleteUser(firebaseUid);
            deletionSummary.firebaseDeleted = true;
        } catch (firebaseErr) {
            console.warn(`[AccountDeletion] Firebase user (${firebaseUid}) deletion skipped:`, firebaseErr.message);
            deletionSummary.firebaseDeleted = false;
        }
    }

    // 12. Delete Auth record itself
    await Auth.findByIdAndDelete(user._id);
    deletionSummary.deletedCollections.auth = 1;

    return deletionSummary;
};
