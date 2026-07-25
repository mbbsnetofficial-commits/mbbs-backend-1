"use strict";

const validate = (schema, source = "query") => (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true
    });
    if (error) {
        res.setHeader("Cache-Control", "no-store");
        return res.status(400).json({
            success: false,
            message: error.details.map(item => item.message).join(" ")
        });
    }
    // Express 5 exposes req.query through a getter, so it cannot be replaced.
    // Keep Joi's sanitized/defaulted values in a separate request object.
    req.validated = req.validated || {};
    req.validated[source] = value;
    return next();
};

const cacheControl = (req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
    return next();
};

module.exports = { validate, cacheControl };
