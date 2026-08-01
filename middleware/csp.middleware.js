"use strict";

const helmet = require("helmet");

/**
 * Strict CSP Policy for core API endpoints (/ , /health, /api/v1/*)
 */
const defaultCsp = helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        formAction: ["'self'"]
    }
});

/**
 * Tailored CSP Policy for Swagger UI interactive documentation (/api-docs)
 * Swagger UI renders inline scripts/styles and makes API requests.
 */
const swaggerCsp = helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:"]
    }
});

/**
 * Dynamic CSP middleware routing requests to either Swagger CSP or Default API CSP.
 */
const cspMiddleware = (req, res, next) => {
    if (req.path && req.path.startsWith("/api-docs")) {
        return swaggerCsp(req, res, next);
    }
    return defaultCsp(req, res, next);
};

module.exports = {
    cspMiddleware,
    defaultCsp,
    swaggerCsp
};
