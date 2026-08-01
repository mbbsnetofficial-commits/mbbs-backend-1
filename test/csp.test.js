"use strict";

const http = require("http");
const assert = require("assert");
const app = require("../app");

console.log("=== Running Content Security Policy (CSP) Tests ===");

const server = app.listen(0, async () => {
    const port = server.address().port;

    const makeRequest = (path, method = "GET") => {
        return new Promise((resolve, reject) => {
            const req = http.request({
                hostname: "127.0.0.1",
                port,
                path,
                method
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
        // Test 1: GET / receives Content-Security-Policy header with expected directives
        let res = await makeRequest("/");
        assert.strictEqual(res.statusCode, 200);
        const cspRoot = res.headers["content-security-policy"];
        assert.ok(cspRoot, "Content-Security-Policy header must be present on GET /");
        assert.ok(cspRoot.includes("default-src 'self'"), "Must contain default-src 'self'");
        assert.ok(cspRoot.includes("object-src 'none'"), "Must contain object-src 'none'");
        assert.ok(cspRoot.includes("base-uri 'self'"), "Must contain base-uri 'self'");
        assert.ok(cspRoot.includes("frame-ancestors 'none'"), "Must contain frame-ancestors 'none'");
        assert.ok(cspRoot.includes("script-src 'self'"), "Must contain script-src 'self'");
        assert.ok(cspRoot.includes("connect-src 'self'"), "Must contain connect-src 'self'");
        console.log("✔ Test 1 PASS: Enforced CSP header present on GET /");

        // Test 2: GET /health receives Content-Security-Policy header
        res = await makeRequest("/health");
        assert.strictEqual(res.statusCode, 200);
        assert.ok(res.headers["content-security-policy"], "Content-Security-Policy header must be present on GET /health");
        console.log("✔ Test 2 PASS: Enforced CSP header present on GET /health");

        // Test 3: GET /api-docs receives Swagger-compatible Content-Security-Policy header
        res = await makeRequest("/api-docs");
        const cspDocs = res.headers["content-security-policy"];
        assert.ok(cspDocs, "Content-Security-Policy header must be present on GET /api-docs");
        assert.ok(cspDocs.includes("script-src 'self' 'unsafe-inline'"), "Must allow script-src 'unsafe-inline' for Swagger UI");
        assert.ok(cspDocs.includes("style-src 'self' 'unsafe-inline'"), "Must allow style-src 'unsafe-inline' for Swagger UI");
        assert.ok(cspDocs.includes("object-src 'none'"), "Must contain object-src 'none' for Swagger UI");
        assert.ok(cspDocs.includes("frame-ancestors 'none'"), "Must contain frame-ancestors 'none' for Swagger UI");
        console.log("✔ Test 3 PASS: Swagger-compatible CSP header present on GET /api-docs");

        // Test 4: API endpoint receives Content-Security-Policy header
        res = await makeRequest("/api/v1/auth/login", "POST");
        assert.ok(res.headers["content-security-policy"], "Content-Security-Policy header must be present on API endpoint");
        console.log("✔ Test 4 PASS: Enforced CSP header present on API endpoints");

        console.log("\nALL CSP TESTS PASSED SUCCESSFULLY! 🎉");
    } catch (err) {
        console.error("\n❌ CSP TEST FAILED:", err);
        process.exitCode = 1;
    } finally {
        server.close();
    }
});
