const Joi = require("joi");
const { PERIODS } = require("../../constants/blog-constants/analytics.const");

const generateSchema = Joi.object({
    period: Joi.string().valid(...Object.values(PERIODS)).required(),
    date: Joi.date().iso()
});
const listSchema = Joi.object({
    period: Joi.string().valid(...Object.values(PERIODS)),
    from: Joi.date().iso(),
    to: Joi.date().iso().min(Joi.ref("from")),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
});
const periodSchema = Joi.object({
    period: Joi.string().valid(...Object.values(PERIODS)).required()
});
const performanceSchema = Joi.object({
    limit: Joi.number().integer().min(1).max(50).default(10)
});

module.exports = { generateSchema, listSchema, periodSchema, performanceSchema };
