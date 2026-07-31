"use strict";

const UcatQuestion = require("../../model/ucat-model/ucatQuestion");

const getQuestions = async (filters = {}, options = {}) => {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const query = {};
    if (filters.subject) {
        query.subject = new RegExp("^" + filters.subject.replace(/_/g, "[ _]?") + "$", "i");
    } else if (filters.section) {
        query.subject = new RegExp("^" + filters.section.replace(/_/g, "[ _]?") + "$", "i");
    }

    if (filters.topic) {
        query.$or = [
            { topic_name: new RegExp(filters.topic, "i") },
            { chapter: new RegExp(filters.topic, "i") }
        ];
    }

    if (filters.difficulty) {
        query.difficulty = new RegExp("^" + filters.difficulty + "$", "i");
    }

    if (filters.questionType || filters.question_type) {
        query.question_type = filters.questionType || filters.question_type;
    }

    const [questions, total] = await Promise.all([
        UcatQuestion.find(query)
            .select("-correct_answer -explanation")
            .sort({ id: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        UcatQuestion.countDocuments(query)
    ]);

    return {
        questions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

const getQuestionById = async (id) => {
    const numId = Number(id);
    return UcatQuestion.findOne({
        $or: [{ id: numId }, { questionId: numId }]
    }).lean();
};

const getQuestionsBySection = async (section, options = {}) => {
    return getQuestions({ section }, options);
};

const getQuestionsByTopic = async (topic, options = {}) => {
    return getQuestions({ topic }, options);
};

const getQuestionFilters = async () => {
    const [sections, topics, difficulties] = await Promise.all([
        UcatQuestion.distinct("subject"),
        UcatQuestion.distinct("topic_name"),
        UcatQuestion.distinct("difficulty")
    ]);

    const test_timings = [
        { value: 15, label: "15 Minutes" },
        { value: 30, label: "30 Minutes" },
        { value: 45, label: "45 Minutes" },
        { value: 60, label: "60 Minutes" },
        { value: 120, label: "120 Minutes (Full Exam)" }
    ];

    const question_count_options = [
        { value: 5, label: "5 Questions" },
        { value: 10, label: "10 Questions" },
        { value: 15, label: "15 Questions" },
        { value: 20, label: "20 Questions" },
        { value: 25, label: "25 Questions" },
        { value: 30, label: "30 Questions" },
        { value: 50, label: "50 Questions" }
    ];

    const test_types = [
        { code: "QUICK_TEST", name: "Quick Test" },
        { code: "CUSTOM_PRACTICE", name: "Custom Practice Test" },
        { code: "PREVIOUS_YEAR", name: "Previous Year Paper" }
    ];

    return {
        sections: sections.filter(Boolean),
        topics: topics.filter(Boolean),
        difficulties: difficulties.filter(Boolean),
        test_timings,
        question_count_options,
        test_types
    };
};

module.exports = {
    getQuestions,
    getQuestionById,
    getQuestionsBySection,
    getQuestionsByTopic,
    getQuestionFilters
};