"use strict";

/**
 * Basic Authentication Middleware for Swagger UI.
 * Restricts access to Swagger documentation endpoints using HTTP Basic Auth.
 * Default Password: sas1627 (configurable via SWAGGER_PASSWORD environment variable).
 */
const swaggerAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        // Parse "Basic <base64(username:password)>"
        const auth = Buffer.from(authHeader.split(" ")[1] || "", "base64")
            .toString()
            .split(":");
        const username = auth[0];
        const password = auth[1];

        const expectedPassword = process.env.SWAGGER_PASSWORD || "sas1627";
        const expectedUser = process.env.SWAGGER_USER; // Optional username check

        if (password === expectedPassword && (!expectedUser || username === expectedUser)) {
            return next();
        }
    }

    res.setHeader("WWW-Authenticate", 'Basic realm="Swagger Documentation"');
    return res.status(401).send("Authentication required to access Swagger UI.");
};

module.exports = swaggerAuth;
