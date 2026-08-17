"use strict";

const http = require("http");
const assert = require("assert");
const mongoose = require("mongoose");
const app = require("../app");

console.log("=== Running Endpoint & Schema Security Tests ===");

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

    const authHeader = `Basic ${Buffer.from("admin:sas1627").toString("base64")}`;

    try {
        // Test 1: GET /health returns minimal status info without leaking secrets
        let res = await makeRequest("/health");
        assert.strictEqual(res.statusCode, 200);
        const healthObj = JSON.parse(res.body);
        assert.strictEqual(healthObj.status, "success");
        assert.ok(healthObj.timestamp, "Must include timestamp");
        assert.strictEqual(healthObj.password, undefined, "Must not leak internal passwords");
        assert.strictEqual(healthObj.connectionString, undefined, "Must not leak database connection strings");
        console.log("✔ Test 1 PASS: /health returns minimal status info without sensitive disclosures");

        // Test 2: GET /api-docs without auth returns 401 Unauthorized
        res = await makeRequest("/api-docs");
        assert.strictEqual(res.statusCode, 401);
        assert.ok(res.headers["www-authenticate"], "Must return WWW-Authenticate header");
        console.log("✔ Test 2 PASS: /api-docs requires HTTP Basic Authentication (401 Unauthorized)");

        // Test 3: GET /openapi.json with basic auth returns OpenAPI JSON schema
        res = await makeRequest("/openapi.json", { "Authorization": authHeader });
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.headers["content-type"].includes("application/json"), true);
        const openapiObj = JSON.parse(res.body);
        assert.ok(openapiObj.openapi || openapiObj.swagger, "Must contain openapi or swagger schema definition");
        console.log("✔ Test 3 PASS: /openapi.json exposed and accessible with basic auth");

        // Test 4: GET /swagger.json with basic auth returns OpenAPI JSON schema
        res = await makeRequest("/swagger.json", { "Authorization": authHeader });
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.headers["content-type"].includes("application/json"), true);
        console.log("✔ Test 4 PASS: /swagger.json exposed as schema alias");

        // Test 5: GET /api/v1/admin/dashboard processed without authentication check
        res = await makeRequest("/api/v1/admin/dashboard");
        assert.ok([200, 404, 500, 503].includes(res.statusCode), `Admin route processed without token check (got ${res.statusCode})`);
        console.log(`✔ Test 5 PASS: Admin dashboard request processed without token requirement (Status: ${res.statusCode})`);

        console.log("\nALL ENDPOINT SECURITY TESTS PASSED SUCCESSFULLY! 🎉");
    } catch (err) {
        console.error("\n❌ ENDPOINT TEST FAILED:", err);
        process.exitCode = 1;
    } finally {
        server.close();
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect().catch(() => {});
        }
        process.exit(process.exitCode || 0);
    }
});
