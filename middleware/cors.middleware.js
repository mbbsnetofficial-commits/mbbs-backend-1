"use strict";

const cors = require("cors");


const normalizeOrigin = (origin) => {
    if (!origin || typeof origin !== "string") return null;
    const trimmed = origin.trim();
    if (!trimmed || trimmed.toLowerCase() === "null") return null;
    try {
        const url = new URL(trimmed);
        return url.origin.toLowerCase();
    } catch {
        return trimmed.replace(/\/+$/, "").toLowerCase();
    }
};


const DEFAULT_TRUSTED_ORIGINS = [
    "http://localhost:4200",
    "http://127.0.0.1:4200",
    "https://mbbs.net",
    "https://www.mbbs.net",
    "https://admin.mbbs.net",
    "http://localhost:5173"
];


const getTrustedOrigins = () => {
    const originsSet = new Set();

    DEFAULT_TRUSTED_ORIGINS.forEach(origin => {
        const normalized = normalizeOrigin(origin);
        if (normalized) originsSet.add(normalized);
    });

    const envOriginsStr = [process.env.FRONTEND_URL, process.env.ALLOWED_ORIGINS]
        .filter(Boolean)
        .join(",");

    if (envOriginsStr) {
        envOriginsStr
            .split(",")
            .map(origin => origin.trim())
            .filter(Boolean)
            .forEach(origin => {
                const normalized = normalizeOrigin(origin);
                if (normalized) originsSet.add(normalized);
            });
    }

    return originsSet;
};


const corsMiddleware = cors((req, callback) => {
    const originHeader = req.headers.origin;


    if (!originHeader) {
        return callback(null, { origin: false, credentials: false });
    }

    const normalizedOrigin = normalizeOrigin(originHeader);


    if (!normalizedOrigin || originHeader.trim().toLowerCase() === "null") {
        return callback(null, { origin: false, credentials: false });
    }

    const trustedOrigins = getTrustedOrigins();


    if (trustedOrigins.has(normalizedOrigin)) {
        return callback(null, {
            origin: true,
            credentials: true,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
            optionsSuccessStatus: 204
        });
    }


    return callback(null, { origin: false, credentials: false });
});

module.exports = {
    corsMiddleware,
    normalizeOrigin,
    getTrustedOrigins,
    DEFAULT_TRUSTED_ORIGINS
};
