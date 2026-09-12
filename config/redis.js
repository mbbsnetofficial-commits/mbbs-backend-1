"use strict";

/**
 * Multi-Tier High-Performance Cache Client
 * Supports Redis when configured, with automatic seamless in-memory LRU fallback.
 */

const memoryStore = new Map();
const memoryTTL = new Map();
const MAX_MEMORY_KEYS = 50000;

// Periodic cleanup of expired in-memory cache entries
setInterval(() => {
    const now = Date.now();
    for (const [key, expiry] of memoryTTL.entries()) {
        if (expiry <= now) {
            memoryStore.delete(key);
            memoryTTL.delete(key);
        }
    }
}, 60000).unref();

let redisClient = null;
let isRedisConnected = false;

const initRedis = () => {
    const redisUrl = process.env.REDIS_URL || (process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` : null);
    
    if (redisUrl) {
        try {
            const Redis = require("ioredis");
            redisClient = new Redis(redisUrl, {
                maxRetriesPerRequest: 2,
                enableReadyCheck: true,
                lazyConnect: true,
                connectTimeout: 5000
            });

            redisClient.on("connect", () => {
                isRedisConnected = true;
                console.log("✔ Connected to Redis Cache Cluster");
            });

            redisClient.on("error", (err) => {
                isRedisConnected = false;
                console.warn("⚠️ [Redis Cache Warning - Falling back to in-memory]:", err.message);
            });

            redisClient.connect().catch(() => {});
        } catch {
            // ioredis not installed, fallback cleanly
            redisClient = null;
        }
    }
};

initRedis();

const getCache = async (key) => {
    if (!key) return null;
    
    if (isRedisConnected && redisClient) {
        try {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch {
            // fallback to memory
        }
    }

    const expiry = memoryTTL.get(key);
    if (expiry && expiry <= Date.now()) {
        memoryStore.delete(key);
        memoryTTL.delete(key);
        return null;
    }

    const item = memoryStore.get(key);
    return item !== undefined ? JSON.parse(JSON.stringify(item)) : null;
};

const setCache = async (key, value, ttlSeconds = 60) => {
    if (!key || value === undefined) return;

    if (isRedisConnected && redisClient) {
        try {
            await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
            return;
        } catch {
            // fallback to memory
        }
    }

    // Memory LRU eviction if max size reached
    if (memoryStore.size >= MAX_MEMORY_KEYS) {
        const firstKey = memoryStore.keys().next().value;
        if (firstKey) {
            memoryStore.delete(firstKey);
            memoryTTL.delete(firstKey);
        }
    }

    memoryStore.set(key, JSON.parse(JSON.stringify(value)));
    if (ttlSeconds > 0) {
        memoryTTL.set(key, Date.now() + ttlSeconds * 1000);
    }
};

const deleteCache = async (key) => {
    if (!key) return;

    if (isRedisConnected && redisClient) {
        try {
            await redisClient.del(key);
        } catch {}
    }

    memoryStore.delete(key);
    memoryTTL.delete(key);
};

const deleteCacheByPattern = async (pattern) => {
    if (!pattern) return;

    if (isRedisConnected && redisClient) {
        try {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(...keys);
            }
        } catch {}
    }

    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    for (const key of memoryStore.keys()) {
        if (regex.test(key)) {
            memoryStore.delete(key);
            memoryTTL.delete(key);
        }
    }
};

const flushAllCache = async () => {
    if (isRedisConnected && redisClient) {
        try {
            await redisClient.flushdb();
        } catch {}
    }
    memoryStore.clear();
    memoryTTL.clear();
};

module.exports = {
    getCache,
    setCache,
    deleteCache,
    deleteCacheByPattern,
    flushAllCache,
    isRedisConnected: () => isRedisConnected
};
