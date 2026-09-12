"use strict";

const http = require("http");
const assert = require("assert");
const app = require("../app");
const { normalizeOrigin, getTrustedOrigins, isOriginAllowed } = require("../middleware/cors.middleware");

console.log("=== Running CORS Unit Tests ===");

// 1. normalizeOrigin
assert.strictEqual(normalizeOrigin("http://localhost:4200"), "http://localhost:4200");
assert.strictEqual(normalizeOrigin("HTTP://LOCALHOST:4200/"), "http://localhost:4200");
assert.strictEqual(normalizeOrigin("https://mbbs.net"), "https://mbbs.net");
assert.strictEqual(normalizeOrigin("https://mbbs.net/"), "https://mbbs.net");
assert.strictEqual(normalizeOrigin("null"), null);
assert.strictEqual(normalizeOrigin("NULL"), null);
assert.strictEqual(normalizeOrigin(""), null);
assert.strictEqual(normalizeOrigin(null), null);
console.log("✔ normalizeOrigin unit tests passed");

// 2. isOriginAllowed checks
const defaultOrigins = getTrustedOrigins();
assert.ok(defaultOrigins.has("http://localhost:4200"), "Must include http://localhost:4200");
assert.ok(defaultOrigins.has("http://127.0.0.1:4200"), "Must include http://127.0.0.1:4200");
assert.ok(defaultOrigins.has("https://mbbs.net"), "Must include https://mbbs.net");
assert.ok(defaultOrigins.has("https://www.mbbs.net"), "Must include https://www.mbbs.net");
assert.ok(defaultOrigins.has("https://admin.mbbs.net"), "Must include https://admin.mbbs.net");
assert.ok(defaultOrigins.has("https://api.mbbs.net"), "Must include https://api.mbbs.net");

// Verify untrusted origins are rejected
assert.strictEqual(isOriginAllowed("https://evil.com"), false, "Must reject evil.com");
assert.strictEqual(isOriginAllowed("https://mbbs.net.attacker.com"), false, "Must reject suffix bypass");
assert.strictEqual(isOriginAllowed("https://attackermbbs.net"), false, "Must reject prefix bypass");
assert.strictEqual(isOriginAllowed("null"), false, "Must reject null origin string");
assert.strictEqual(isOriginAllowed("http://mbbs.net"), false, "Must reject unencrypted HTTP for production domain");
console.log("✔ isOriginAllowed security validation tests passed");

console.log("\n=== Running CORS Integration HTTP Tests Across Scanner Findings ===");

const server = app.listen(0, async () => {
    const port = server.address().port;

    const makeRequest = (path, headers = {}, method = "GET") => {
        return new Promise((resolve, reject) => {
            const req = http.request({
                hostname: "127.0.0.1",
                port,
                path,
                method,
                headers
            }, (res) => {
                let body = "";
                res.on("data", chunk => body += chunk);
                res.on("end", () => resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body
                }));
            });
            req.on("error", reject);
            req.end();
        });
    };

    try {
        // Finding 1 Asset: https://api.mbbs.net ('/')
        // Trusted origin allowed
        let res = await makeRequest("/", { "Origin": "https://mbbs.net" });
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.headers["access-control-allow-origin"], "https://mbbs.net");
        assert.strictEqual(res.headers["access-control-allow-credentials"], "true");
        console.log("✔ Finding 1 Test: Trusted origin https://mbbs.net allowed on '/'");

        // Untrusted origin blocked on '/'
        res = await makeRequest("/", { "Origin": "https://evil.com" });
        assert.strictEqual(res.headers["access-control-allow-origin"], undefined, "Must NOT reflect untrusted origin on '/'");
        assert.strictEqual(res.headers["access-control-allow-credentials"], undefined, "Must NOT send credentials to untrusted origin");
        console.log("✔ Finding 1 Test: Untrusted origin https://evil.com blocked on '/'");

        // Finding 2 Asset: https://api.mbbs.net/api/v1
        res = await makeRequest("/api/v1/auth/login", { "Origin": "https://www.mbbs.net" });
        assert.strictEqual(res.headers["access-control-allow-origin"], "https://www.mbbs.net");
        console.log("✔ Finding 2 Test: Trusted origin https://www.mbbs.net allowed on '/api/v1/auth/login'");

        res = await makeRequest("/api/v1/auth/login", { "Origin": "https://evil.com" });
        assert.strictEqual(res.headers["access-control-allow-origin"], undefined, "Must NOT reflect untrusted origin on '/api/v1'");
        assert.strictEqual(res.headers["access-control-allow-credentials"], undefined);
        console.log("✔ Finding 2 Test: Untrusted origin https://evil.com blocked on '/api/v1'");

        // Finding 3 Asset: https://api.mbbs.net/swagger.json
        const authHeader = `Basic ${Buffer.from("admin:sas1627").toString("base64")}`;
        res = await makeRequest("/swagger.json", { "Origin": "https://admin.mbbs.net", "Authorization": authHeader });
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.headers["access-control-allow-origin"], "https://admin.mbbs.net");
        console.log("✔ Finding 3 Test: Trusted origin allowed on '/swagger.json'");

        res = await makeRequest("/swagger.json", { "Origin": "https://evil.com", "Authorization": authHeader });
        assert.strictEqual(res.headers["access-control-allow-origin"], undefined, "Must NOT reflect untrusted origin on '/swagger.json'");
        console.log("✔ Finding 3 Test: Untrusted origin blocked on '/swagger.json'");

        // Finding 4 Asset: https://api.mbbs.net/api-docs
        res = await makeRequest("/api-docs", { "Origin": "https://mbbs.net", "Authorization": authHeader });
        assert.strictEqual(res.headers["access-control-allow-origin"], "https://mbbs.net");
        console.log("✔ Finding 4 Test: Trusted origin allowed on '/api-docs'");

        res = await makeRequest("/api-docs", { "Origin": "https://evil.com", "Authorization": authHeader });
        assert.strictEqual(res.headers["access-control-allow-origin"], undefined, "Must NOT reflect untrusted origin on '/api-docs'");
        console.log("✔ Finding 4 Test: Untrusted origin blocked on '/api-docs'");

        // Finding 5 Asset: https://api.mbbs.net/openapi.json
        res = await makeRequest("/openapi.json", { "Origin": "https://admin.mbbs.net", "Authorization": authHeader });
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.headers["access-control-allow-origin"], "https://admin.mbbs.net");
        console.log("✔ Finding 5 Test: Trusted origin allowed on '/openapi.json'");

        res = await makeRequest("/openapi.json", { "Origin": "https://evil.com", "Authorization": authHeader });
        assert.strictEqual(res.headers["access-control-allow-origin"], undefined, "Must NOT reflect untrusted origin on '/openapi.json'");
        console.log("✔ Finding 5 Test: Untrusted origin blocked on '/openapi.json'");

        // Finding 6 Asset: https://api.mbbs.net/health
        res = await makeRequest("/health", { "Origin": "http://localhost:4200" });
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.headers["access-control-allow-origin"], "http://localhost:4200");
        console.log("✔ Finding 6 Test: Localhost developer origin allowed on '/health'");

        res = await makeRequest("/health", { "Origin": "https://mbbs.net.attacker.com" });
        assert.strictEqual(res.headers["access-control-allow-origin"], undefined, "Must NOT reflect spoofed subdomain on '/health'");
        console.log("✔ Finding 6 Test: Spoofed attacker origin blocked on '/health'");

        // Preflight OPTIONS validation
        res = await makeRequest("/api/v1/auth/login", {
            "Origin": "https://mbbs.net",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type"
        }, "OPTIONS");
        assert.strictEqual(res.statusCode, 204);
        assert.strictEqual(res.headers["access-control-allow-origin"], "https://mbbs.net");
        assert.strictEqual(res.headers["access-control-allow-credentials"], "true");
        console.log("✔ Preflight Test: OPTIONS allowed for trusted origin");

        res = await makeRequest("/api/v1/auth/login", {
            "Origin": "https://evil.com",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type"
        }, "OPTIONS");
        assert.strictEqual(res.headers["access-control-allow-origin"], undefined, "Preflight must not set allow-origin for untrusted origin");
        console.log("✔ Preflight Test: OPTIONS rejected CORS headers for untrusted origin");

        // Non-browser request without Origin header
        res = await makeRequest("/health");
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.headers["access-control-allow-origin"], undefined);
        console.log("✔ Non-browser request succeeds cleanly without CORS headers");

        console.log("\nALL CORS REGRESSION SECURITY TESTS PASSED SUCCESSFULLY! 🎉");
    } catch (err) {
        console.error("\n❌ CORS TEST FAILED:", err);
        process.exitCode = 1;
    } finally {
        server.close();
        process.exit(process.exitCode || 0);
    }
});
