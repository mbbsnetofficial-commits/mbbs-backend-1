"use strict";

const http = require("http");
const assert = require("assert");
const app = require("../app");

console.log("=== Running Permissions-Policy Tests ===");

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
        // Test 1: GET / receives Permissions-Policy header
        let res = await makeRequest("/");
        assert.strictEqual(res.statusCode, 200);
        const policyRoot = res.headers["permissions-policy"];
        assert.ok(policyRoot, "Permissions-Policy header must be present on GET /");
        assert.ok(policyRoot.includes("camera=()"), "Must contain camera=()");
        assert.ok(policyRoot.includes("microphone=()"), "Must contain microphone=()");
        assert.ok(policyRoot.includes("geolocation=()"), "Must contain geolocation=()");
        assert.ok(policyRoot.includes("accelerometer=()"), "Must contain accelerometer=()");
        assert.ok(policyRoot.includes("gyroscope=()"), "Must contain gyroscope=()");
        assert.ok(policyRoot.includes("magnetometer=()"), "Must contain magnetometer=()");
        console.log("✔ Test 1 PASS: Permissions-Policy header present on GET /");

        // Test 2: GET /health receives Permissions-Policy header
        res = await makeRequest("/health");
        assert.strictEqual(res.statusCode, 200);
        assert.ok(res.headers["permissions-policy"], "Permissions-Policy header must be present on GET /health");
        console.log("✔ Test 2 PASS: Permissions-Policy header present on GET /health");

        // Test 3: GET /api-docs receives Permissions-Policy header
        res = await makeRequest("/api-docs");
        assert.ok(res.headers["permissions-policy"], "Permissions-Policy header must be present on GET /api-docs");
        console.log("✔ Test 3 PASS: Permissions-Policy header present on GET /api-docs");

        // Test 4: POST /api/v1/auth/login receives Permissions-Policy header
        res = await makeRequest("/api/v1/auth/login", "POST");
        assert.ok(res.headers["permissions-policy"], "Permissions-Policy header must be present on API endpoints");
        console.log("✔ Test 4 PASS: Permissions-Policy header present on API endpoints");

        console.log("\nALL PERMISSIONS-POLICY TESTS PASSED SUCCESSFULLY! 🎉");
    } catch (err) {
        console.error("\n❌ PERMISSIONS-POLICY TEST FAILED:", err);
        process.exitCode = 1;
    } finally {
        server.close();
        process.exit(process.exitCode || 0);
    }
});
