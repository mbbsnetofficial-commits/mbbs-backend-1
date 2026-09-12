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
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://mbbs.net",
    "https://www.mbbs.net",
    "https://admin.mbbs.net",
    "https://api.mbbs.net",
    "https://student.mbbs.net",
    "https://portal.mbbs.net"
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

const isOriginAllowed = (origin) => {
    if (!origin) return true;
    const normalized = normalizeOrigin(origin);
    if (!normalized) return false;

    const trusted = getTrustedOrigins();
    if (trusted.has(normalized)) return true;

    // Allow legitimate mbbs.net subdomains over HTTPS
    try {
        const parsed = new URL(normalized);
        if (parsed.protocol === "https:" && (parsed.hostname === "mbbs.net" || parsed.hostname.endsWith(".mbbs.net"))) {
            return true;
        }
    } catch {
        return false;
    }

    return false;
};

const corsMiddleware = cors((req, callback) => {
    const originHeader = req.headers.origin;
    const allowed = isOriginAllowed(originHeader);

    if (allowed && originHeader) {
        return callback(null, {
            origin: originHeader,
            credentials: true,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
            allowedHeaders: [
                "Content-Type",
                "Authorization",
                "X-Requested-With",
                "Accept",
                "X-Is-Admin",
                "x-is-admin",
                "X-User-Id",
                "x-user-id",
                "x-admin-secret",
                "isAdmin"
            ],
            optionsSuccessStatus: 204
        });
    }

    // Do not reflect untrusted origins and do not enable credentials for arbitrary origins
    return callback(null, {
        origin: false,
        credentials: false,
        optionsSuccessStatus: 204
    });
});

module.exports = {
    corsMiddleware,
    normalizeOrigin,
    getTrustedOrigins,
    isOriginAllowed,
    DEFAULT_TRUSTED_ORIGINS
};
