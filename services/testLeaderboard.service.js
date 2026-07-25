"use strict";

const TestSession = require("../model/neet-models/testSession");

class LeaderboardError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

const PERIODS = ["ALL", "DAILY", "WEEKLY", "MONTHLY"];
const TEST_TYPES = ["Quick Test", "Previous Year"];

const parseOptions = query => {
    const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100);
    const period = String(query.period || "ALL").toUpperCase();
    const testType = query.test_type || null;

    if (!PERIODS.includes(period)) {
        throw new LeaderboardError(400, "period must be ALL, DAILY, WEEKLY, or MONTHLY.");
    }
    if (testType && !TEST_TYPES.includes(testType)) {
        throw new LeaderboardError(400, "test_type must be Quick Test or Previous Year.");
    }

    let paperId = null;
    if (query.previous_year_paper_id !== undefined) {
        paperId = Number(query.previous_year_paper_id);
        if (!Number.isInteger(paperId) || paperId < 1) {
            throw new LeaderboardError(400, "previous_year_paper_id must be a positive integer.");
        }
        if (testType && testType !== "Previous Year") {
            throw new LeaderboardError(
                400,
                "previous_year_paper_id can only be used with test_type=Previous Year."
            );
        }
    }

    return { page, limit, period, testType, paperId };
};

const periodStart = period => {
    const now = new Date();
    if (period === "DAILY") {
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    if (period === "WEEKLY") {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const day = start.getDay() || 7;
        start.setDate(start.getDate() - day + 1);
        return start;
    }
    if (period === "MONTHLY") {
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    return null;
};

const buildMatch = options => {
    const match = { status: "Completed", submitted_at: { $type: "date" } };
    const start = periodStart(options.period);
    if (start) match.submitted_at.$gte = start;
    if (options.testType) match.test_type = options.testType;
    if (options.paperId) {
        match.test_type = "Previous Year";
        match.previous_year_paper_id = options.paperId;
    }
    return match;
};

const rankingPipeline = options => [
    { $match: buildMatch(options) },
    {
        $set: {
            total_time_spent: {
                $sum: {
                    $map: {
                        input: { $ifNull: ["$answers", []] },
                        as: "answer",
                        in: { $ifNull: ["$$answer.time_spent", 0] }
                    }
                }
            },
            normalized_score: {
                $cond: [
                    { $gt: ["$total_questions", 0] },
                    {
                        $round: [
                            {
                                $multiply: [
                                    { $divide: ["$score", { $multiply: ["$total_questions", 4] }] },
                                    100
                                ]
                            },
                            2
                        ]
                    },
                    0
                ]
            }
        }
    },
    {
        $sort: {
            normalized_score: -1,
            correct: -1,
            accuracy: -1,
            total_time_spent: 1,
            submitted_at: 1
        }
    },
    {
        $group: {
            _id: "$student_id",
            best_attempt: { $first: "$$ROOT" }
        }
    },
    { $replaceRoot: { newRoot: "$best_attempt" } },
    {
        $lookup: {
            from: "neet-auth",
            localField: "student_id",
            foreignField: "student_id",
            as: "student"
        }
    },
    { $set: { student: { $first: "$student" } } },
    { $match: { "student.is_active": true } },
    {
        $sort: {
            normalized_score: -1,
            correct: -1,
            accuracy: -1,
            total_time_spent: 1,
            submitted_at: 1
        }
    },
    {
        $project: {
            _id: 0,
            session_id: "$_id",
            student_id: 1,
            student_name: {
                $trim: {
                    input: {
                        $concat: [
                            { $ifNull: ["$student.firstName", ""] },
                            " ",
                            { $ifNull: ["$student.lastName", ""] }
                        ]
                    }
                }
            },
            test_type: 1,
            previous_year_paper_id: 1,
            score: 1,
            normalized_score: 1,
            total_questions: 1,
            correct: 1,
            wrong: 1,
            skipped: 1,
            accuracy: 1,
            total_time_spent: 1,
            submitted_at: 1
        }
    }
];

exports.getLeaderboard = async query => {
    const options = parseOptions(query);
    const skip = (options.page - 1) * options.limit;
    const [result] = await TestSession.aggregate([
        ...rankingPipeline(options),
        {
            $facet: {
                data: [{ $skip: skip }, { $limit: options.limit }],
                metadata: [{ $count: "total" }]
            }
        }
    ]);

    const total = result?.metadata?.[0]?.total || 0;
    const data = (result?.data || []).map((entry, index) => ({
        rank: skip + index + 1,
        ...entry
    }));

    return {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
        period: options.period,
        data
    };
};

exports.getMyRank = async (studentId, query) => {
    const options = parseOptions(query);
    const entries = await TestSession.aggregate(rankingPipeline(options));
    const index = entries.findIndex(entry => entry.student_id === studentId);

    if (index === -1) {
        throw new LeaderboardError(404, "No eligible completed test was found for this student.");
    }
    return {
        period: options.period,
        data: { rank: index + 1, ...entries[index] }
    };
};
