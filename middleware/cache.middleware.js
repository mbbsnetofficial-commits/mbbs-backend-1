"use strict";

const { getCache, setCache } = require("../config/redis");

/**
 * High-performance route caching middleware for read-heavy GET requests.
 * @param {number} ttlSeconds Time to live in seconds (default: 60)
 * @param {function} keyGenerator Optional custom key generator
 */
const cacheResponse = (ttlSeconds = 60, keyGenerator = null) => {
    return async (req, res, next) => {
        if (req.method !== "GET") {
            return next();
        }

        const cacheKey = keyGenerator
            ? keyGenerator(req)
            : `cache:${req.user?.id || req.user?._id || "public"}:${req.originalUrl || req.url}`;

        try {
            const cachedData = await getCache(cacheKey);
            if (cachedData) {
                res.setHeader("X-Cache", "HIT");
                return res.status(200).json(cachedData);
            }
        } catch {
            // Proceed to controller if cache check fails
        }

        res.setHeader("X-Cache", "MISS");

        const originalJson = res.json.bind(res);
        res.json = (body) => {
            if (res.statusCode >= 200 && res.statusCode < 300 && body) {
                setCache(cacheKey, body, ttlSeconds).catch(() => {});
            }
            return originalJson(body);
        };

        next();
    };
};

module.exports = {
    cacheResponse
};
