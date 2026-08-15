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
    // Allow all origins, methods, and headers to eliminate CORS errors for all APIs
    return callback(null, {
        origin: true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "X-Is-Admin", "x-is-admin", "X-User-Id", "x-user-id", "x-admin-secret", "isAdmin", "*"],
        optionsSuccessStatus: 204
    });
});

module.exports = {
    corsMiddleware,
    normalizeOrigin,
    getTrustedOrigins,
    DEFAULT_TRUSTED_ORIGINS
};
