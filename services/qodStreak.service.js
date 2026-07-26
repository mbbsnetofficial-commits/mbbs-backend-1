"use strict";

const QuestionOfTheDay = require("../model/neet-models/qod");
const QuestionSubmission = require("../model/neet-models/qodsubmission");
const QodStreak = require("../model/neet-models/qodStreak");

const APP_TIMEZONE = process.env.APP_TIMEZONE || "Asia/Kolkata";
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

class QodStreakError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

const dateKey = date => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: APP_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(date);
    const value = type => parts.find(part => part.type === type)?.value;
    return `${value("year")}-${value("month")}-${value("day")}`;
};

const differenceInDays = (fromKey, toKey) => {
    const from = Date.parse(`${fromKey}T00:00:00.000Z`);
    const to = Date.parse(`${toKey}T00:00:00.000Z`);
    return Math.round((to - from) / 86400000);
};

const loadStudentHistory = async studentId => {
    const submissions = await QuestionSubmission.find({ student_id: studentId })
        .select("question_id is_correct submitted_at qod_date_key")
        .sort({ submitted_at: 1 })
        .lean();

    const missingDateIds = submissions
        .filter(item => !item.qod_date_key)
        .map(item => item.question_id);
    const questions = missingDateIds.length
        ? await QuestionOfTheDay.find({ id: { $in: missingDateIds } })
            .select("id question_date")
            .lean()
        : [];
    const questionDateById = new Map(
        questions.map(question => [question.id, question.question_date])
    );

    const byDay = new Map();
    for (const submission of submissions) {
        const scheduledDate = questionDateById.get(submission.question_id);
        const key = submission.qod_date_key ||
            dateKey(scheduledDate || submission.submitted_at);
        if (!byDay.has(key)) {
            byDay.set(key, {
                date: key,
                answered: true,
                is_correct: Boolean(submission.is_correct),
                question_id: submission.question_id
            });
        } else if (submission.is_correct) {
            byDay.get(key).is_correct = true;
        }
    }
    return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
};

const calculateSummary = history => {
    let longestStreak = 0;
    let latestRun = 0;
    let runStart = null;
    let latestRunStart = null;

    history.forEach((entry, index) => {
        const consecutive = index > 0 &&
            differenceInDays(history[index - 1].date, entry.date) === 1;
        if (!consecutive) {
            latestRun = 1;
            runStart = entry.date;
        } else {
            latestRun += 1;
        }
        latestRunStart = runStart;
        longestStreak = Math.max(longestStreak, latestRun);
    });

    const today = dateKey(new Date());
    const lastDate = history.at(-1)?.date || null;
    const isCurrent = lastDate && differenceInDays(lastDate, today) <= 1;

    return {
        current_streak: isCurrent ? latestRun : 0,
        longest_streak: longestStreak,
        total_days_answered: history.length,
        correct_answer_count: history.filter(item => item.is_correct).length,
        last_answered_date: lastDate,
        streak_started_at: isCurrent ? latestRunStart : null
    };
};

exports.findTodaysQuestion = async () => {
    const now = new Date();
    const nearbyQuestions = await QuestionOfTheDay.find({
        is_active: { $ne: false },
        question_date: {
            $gte: new Date(now.getTime() - 36 * 60 * 60 * 1000),
            $lte: new Date(now.getTime() + 36 * 60 * 60 * 1000)
        }
    }).sort({ question_date: 1 });
    const today = dateKey(now);
    return nearbyQuestions.find(question => dateKey(question.question_date) === today) || null;
};

exports.rebuildStudentStreak = async studentId => {
    const history = await loadStudentHistory(studentId);
    const summary = calculateSummary(history);
    const streak = await QodStreak.findOneAndUpdate(
        { student_id: studentId },
        { $set: summary },
        {
            upsert: true,
            returnDocument: "after",
            runValidators: true,
            setDefaultsOnInsert: true
        }
    ).lean();
    return { streak, history };
};

exports.getStudentStreak = async studentId => {
    const { streak, history } = await exports.rebuildStudentStreak(studentId);
    const today = dateKey(new Date());
    const todayEntry = history.find(item => item.date === today);
    return {
        current_streak: streak.current_streak,
        longest_streak: streak.longest_streak,
        total_days_answered: streak.total_days_answered,
        correct_answer_count: streak.correct_answer_count,
        last_answered_date: streak.last_answered_date,
        streak_started_at: streak.streak_started_at,
        answered_today: Boolean(todayEntry),
        today_correct: todayEntry ? todayEntry.is_correct : null,
        timezone: APP_TIMEZONE
    };
};

exports.getStudentStreakHistory = async (studentId, month) => {
    const selectedMonth = month || dateKey(new Date()).slice(0, 7);
    if (!MONTH_PATTERN.test(selectedMonth)) {
        throw new QodStreakError(400, "month must use YYYY-MM format.");
    }
    const { history } = await exports.rebuildStudentStreak(studentId);
    return {
        month: selectedMonth,
        timezone: APP_TIMEZONE,
        data: history.filter(item => item.date.startsWith(selectedMonth))
    };
};

exports.dateKey = dateKey;
