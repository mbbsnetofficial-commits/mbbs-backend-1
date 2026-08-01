"use strict";

/**
 * Middleware enforcing strict Permissions-Policy header on all API responses.
 * Restricts unneeded browser APIs (camera, microphone, geolocation, payment, usb, fullscreen).
 */
const permissionsPolicyMiddleware = (req, res, next) => {
    res.setHeader(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=(), accelerometer=(), gyroscope=(), magnetometer=()"
    );
    return next();
};

module.exports = { permissionsPolicyMiddleware };
