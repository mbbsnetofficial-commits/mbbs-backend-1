const crypto = require("crypto");

const ADMIN_KEY_CONTEXT = "mbbs.net/platform-admin/jwt/v1";

const getAdminSigningKey = () => {
    const explicitKey = process.env.ADMIN_SECRET_KEY?.trim();
    if (explicitKey) {
        return { key: explicitKey, source: "ADMIN_SECRET_KEY" };
    }

    const applicationKey = process.env.SECRET_KEY?.trim();
    if (applicationKey) {
        // Never sign admin JWTs directly with the student JWT secret. Derive a
        // deterministic, domain-separated key so the token classes remain
        // cryptographically distinct when ADMIN_SECRET_KEY is not configured.
        const derivedKey = crypto
            .createHmac("sha256", applicationKey)
            .update(ADMIN_KEY_CONTEXT)
            .digest("hex");
        return { key: derivedKey, source: "derived-from-SECRET_KEY" };
    }

    return null;
};

module.exports = { getAdminSigningKey };
