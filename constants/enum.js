// constants/enum.js

// =============================
// SUBJECT ENUM
// =============================
const SUBJECT_ENUM = Object.freeze([
    "Physics",
    "Chemistry",
    "Botany",
    "Zoology"
]);

// =============================
// QUESTION COUNT ENUM
// =============================
const QUESTION_COUNT_ENUM = Object.freeze([
    15,
    20,
    25,
    30,
    35,
    40
]);

// =============================
// TIME LIMIT ENUM
// =============================
const TIME_LIMIT_ENUM = Object.freeze([
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60
]);

// =============================
// REVIEW COMMENT ENUMS
// =============================
const REVIEW_TYPE_ENUM = Object.freeze([
    "app",
    "test",
    "chatbot",
    "question",
    "other"
]);

const REVIEW_STATUS_ENUM = Object.freeze([
    "pending",
    "reviewed",
    "resolved",
    "rejected"
]);

// =============================
// NOTIFICATION ENUMS
// =============================
const NOTIFICATION_TYPE_ENUM = Object.freeze([
    "system",
    "test",
    "qod",
    "chatbot",
    "account",
    "reminder"
]);

const NOTIFICATION_PRIORITY_ENUM = Object.freeze([
    "low",
    "normal",
    "high"
]);

module.exports = {
    SUBJECT_ENUM,
    QUESTION_COUNT_ENUM,
    TIME_LIMIT_ENUM,
    REVIEW_TYPE_ENUM,
    REVIEW_STATUS_ENUM,
    NOTIFICATION_TYPE_ENUM,
    NOTIFICATION_PRIORITY_ENUM
};
