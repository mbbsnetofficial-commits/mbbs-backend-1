const validate = (schema, source = "query") => (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details.map(item => item.message).join(" ")
        });
    }
    req[source] = value;
    return next();
};

module.exports = { validate };
