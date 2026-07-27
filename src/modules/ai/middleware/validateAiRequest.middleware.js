"use strict";

const validateAiRequest = schema => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details.map(item => item.message).join(" ")
        });
    }
    req.validatedAiBody = value;
    return next();
};

module.exports = { validateAiRequest };

