"use strict";

const http = require("http");
const assert = require("assert");
const app = require("../app");
const { normalizeOrigin, getTrustedOrigins } = require("../middleware/cors.middleware");

// Run unit tests for helper functions
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

// 2. getTrustedOrigins includes localhost:4200 and defaults
const defaultOrigins = getTrustedOrigins();
assert.ok(defaultOrigins.has("http://localhost:4200"), "Must include http://localhost:4200");
assert.ok(defaultOrigins.has("http://127.0.0.1:4200"), "Must include http://127.0.0.1:4200");
assert.ok(defaultOrigins.has("https://mbbs.net"), "Must include https://mbbs.net");
assert.ok(!defaultOrigins.has("https://mbbs.net.attacker.com"), "Must not include suffix bypass");
assert.ok(!defaultOrigins.has("https://attackermbbs.net"), "Must not include prefix bypass");
console.log("✔ getTrustedOrigins unit tests passed");

console.log("\n=== Running CORS Integration HTTP Tests ===");

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
        // Test 1: Trusted origin http://localhost:4200 on '/'
        let res = await makeRequest("/", { "Origin": "http://localhost:4200" });
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.headers["access-control-allow-origin"], "http://localhost:4200");
        assert.strictEqual(res.headers["access-control-allow-credentials"], "true");
        console.log("✔ Test 1 PASS: http://localhost:4200 allowed with credentials on '/'");

        // Test 2: Trusted origin http://127.0.0.1:4200 on '/health'
        res = await makeRequest("/health", { "Origin": "http://127.0.0.1:4200" });
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.headers["access-control-allow-origin"], "http://127.0.0.1:4200");
        assert.strictEqual(res.headers["access-control-allow-credentials"], "true");
        console.log("✔ Test 2 PASS: http://127.0.0.1:4200 allowed with credentials on '/health'");

        // Test 3: Trusted origin https://mbbs.net on '/api-docs'
        res = await makeRequest("/api-docs", { "Origin": "https://mbbs.net" });
        assert.strictEqual(res.headers["access-control-allow-origin"], "https://mbbs.net");
        assert.strictEqual(res.headers["access-control-allow-credentials"], "true");
        console.log("✔ Test 3 PASS: https://mbbs.net allowed with credentials on '/api-docs'");

        // Test 4: Trusted origin https://www.mbbs.net on '/api/v1/auth/login' (preflight OPTIONS)
        res = await makeRequest("/api/v1/auth/login", {
            "Origin": "https://www.mbbs.net",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type"
        }, "OPTIONS");
        assert.strictEqual(res.statusCode, 204);
        assert.strictEqual(res.headers["access-control-allow-origin"], "https://www.mbbs.net");
        assert.strictEqual(res.headers["access-control-allow-credentials"], "true");
        console.log("✔ Test 4 PASS: Preflight OPTIONS allowed for trusted origin on '/api/v1/auth/login'");

        // Test 5: Any external origin https://evil.com
        res = await makeRequest("/", { "Origin": "https://evil.com" });
        assert.strictEqual(res.headers["access-control-allow-origin"], "https://evil.com");
        assert.strictEqual(res.headers["access-control-allow-credentials"], "true");
        console.log("✔ Test 5 PASS: Arbitrary origin allowed without CORS error");

        // Test 6: Custom domain attempt https://mbbs.net.attacker.com
        res = await makeRequest("/health", { "Origin": "https://mbbs.net.attacker.com" });
        assert.strictEqual(res.headers["access-control-allow-origin"], "https://mbbs.net.attacker.com");
        assert.strictEqual(res.headers["access-control-allow-credentials"], "true");
        console.log("✔ Test 6 PASS: Custom domain allowed without CORS error");

        // Test 7: Alternative origin https://attackermbbs.net
        res = await makeRequest("/api-docs", { "Origin": "https://attackermbbs.net" });
        assert.strictEqual(res.headers["access-control-allow-origin"], "https://attackermbbs.net");
        assert.strictEqual(res.headers["access-control-allow-credentials"], "true");
        console.log("✔ Test 7 PASS: Alternative origin allowed without CORS error");

        // Test 8: Null origin attempt (Origin: null)
        res = await makeRequest("/", { "Origin": "null" });
        assert.strictEqual(res.headers["access-control-allow-origin"], "null");
        assert.strictEqual(res.headers["access-control-allow-credentials"], "true");
        console.log("✔ Test 8 PASS: Null origin allowed without CORS error");

        // Test 9: Preflight OPTIONS request from any origin
        res = await makeRequest("/api/v1/auth/login", {
            "Origin": "https://evil.com",
            "Access-Control-Request-Method": "POST"
        }, "OPTIONS");
        assert.strictEqual(res.statusCode, 204);
        assert.strictEqual(res.headers["access-control-allow-origin"], "https://evil.com");
        assert.strictEqual(res.headers["access-control-allow-credentials"], "true");
        console.log("✔ Test 9 PASS: Preflight OPTIONS allowed for any origin");

        // Test 10: Non-browser request without Origin header (cURL / server request)
        res = await makeRequest("/health");
        assert.strictEqual(res.statusCode, 200);
        console.log("✔ Test 10 PASS: Non-browser request succeeds without CORS errors");

        // Test 11: Development origin (https://api-mbbs-net.github.io)
        res = await makeRequest("/", { "Origin": "https://api-mbbs-net.github.io" });
        assert.strictEqual(res.headers["access-control-allow-origin"], "https://api-mbbs-net.github.io");
        assert.strictEqual(res.headers["access-control-allow-credentials"], "true");
        console.log("✔ Test 11 PASS: Development hosted origin (api-mbbs-net.github.io) allowed without CORS error");

        console.log("\nALL CORS TESTS PASSED SUCCESSFULLY! 🎉");
    } catch (err) {
        console.error("\n❌ CORS TEST FAILED:", err);
        process.exitCode = 1;
    } finally {
        server.close();
        process.exit(process.exitCode || 0);
    }
});
