"use strict";

const hasUnsafeKey = value => {
    if (!value || typeof value !== "object") return false;
    const seen = new WeakSet();
    const stack = [value];

    while (stack.length) {
        const current = stack.pop();
        if (!current || typeof current !== "object" || seen.has(current)) continue;
        seen.add(current);

        for (const key of Object.keys(current)) {
            if (
                key.startsWith("$") ||
                key.includes(".") ||
                ["__proto__", "prototype", "constructor"].includes(key)
            ) {
                return true;
            }
            stack.push(current[key]);
        }
    }
    return false;
};

const rejectUnsafeRequestKeys = (req, res, next) => {
    if ([req.body, req.query, req.params].some(hasUnsafeKey)) {
        return res.status(400).json({
            status: "fail",
            message: "Request contains an unsafe field name."
        });
    }
    return next();
};

module.exports = { rejectUnsafeRequestKeys, hasUnsafeKey };
