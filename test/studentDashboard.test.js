"use strict";

const http = require("http");
const assert = require("assert");
const app = require("../app");

console.log("=== Running Student Dashboard & University Finder API Tests ===");

const server = app.listen(0, async () => {
    const port = server.address().port;

    const makeRequest = (path, token = null, method = "GET", body = null) => {
        return new Promise((resolve, reject) => {
            const headers = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
            if (body) {
                headers["Content-Type"] = "application/json";
            }

            const req = http.request({
                hostname: "127.0.0.1",
                port,
                path,
                method,
                headers
            }, (res) => {
                let data = "";
                res.on("data", chunk => data += chunk);
                res.on("end", () => resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                }));
            });

            req.on("error", reject);
            if (body) {
                req.write(JSON.stringify(body));
            }
            req.end();
        });
    };

    try {
        // Test 1: GET /api/v1/student/dashboard/summary without token rejects with 401 Unauthorized
        let res = await makeRequest("/api/v1/student/dashboard/summary");
        assert.strictEqual(res.statusCode, 401, "Summary endpoint must require authentication");
        let parsed = JSON.parse(res.body);
        assert.strictEqual(parsed.status, "fail");
        console.log("✔ Test 1 PASS: GET /api/v1/student/dashboard/summary requires JWT authentication (401 Unauthorized)");

        // Test 2: GET /api/v1/student/dashboard/stats without token rejects with 401 Unauthorized
        res = await makeRequest("/api/v1/student/dashboard/stats");
        assert.strictEqual(res.statusCode, 401, "Stats endpoint must require authentication");
        parsed = JSON.parse(res.body);
        assert.strictEqual(parsed.status, "fail");
        console.log("✔ Test 2 PASS: GET /api/v1/student/dashboard/stats requires JWT authentication (401 Unauthorized)");

        // Test 3: GET /api/v1/student/dashboard/saved-blogs without token rejects with 401 Unauthorized
        res = await makeRequest("/api/v1/student/dashboard/saved-blogs");
        assert.strictEqual(res.statusCode, 401, "Saved blogs endpoint must require authentication");
        parsed = JSON.parse(res.body);
        assert.strictEqual(parsed.status, "fail");
        console.log("✔ Test 3 PASS: GET /api/v1/student/dashboard/saved-blogs requires JWT authentication (401 Unauthorized)");

        // Test 4: GET /api/v1/student/dashboard/university-finder/saved-universities without token rejects with 401 Unauthorized
        res = await makeRequest("/api/v1/student/dashboard/university-finder/saved-universities");
        assert.strictEqual(res.statusCode, 401, "Saved universities endpoint must require authentication");
        parsed = JSON.parse(res.body);
        assert.strictEqual(parsed.status, "fail");
        console.log("✔ Test 4 PASS: GET /api/v1/student/dashboard/university-finder/saved-universities requires JWT authentication (401 Unauthorized)");

        // Test 5: POST /api/v1/student/dashboard/university-finder/save-university without token rejects with 401 Unauthorized
        res = await makeRequest("/api/v1/student/dashboard/university-finder/save-university", null, "POST", { university_id: "1", university_name: "Test Uni" });
        assert.strictEqual(res.statusCode, 401, "Save university endpoint must require authentication");
        console.log("✔ Test 5 PASS: POST /api/v1/student/dashboard/university-finder/save-university requires JWT authentication (401 Unauthorized)");

        // Test 6: GET /api/v1/student/dashboard/university-finder/recommendations without token rejects with 401 Unauthorized
        res = await makeRequest("/api/v1/student/dashboard/university-finder/recommendations");
        assert.strictEqual(res.statusCode, 401, "Recommendations endpoint must require authentication");
        console.log("✔ Test 6 PASS: GET /api/v1/student/dashboard/university-finder/recommendations requires JWT authentication (401 Unauthorized)");

        // Test 7: Reject malformed / invalid bearer token with 401 Unauthorized
        res = await makeRequest("/api/v1/student/dashboard/summary", "invalid.jwt.token");
        assert.strictEqual(res.statusCode, 401, "Must reject invalid token");
        console.log("✔ Test 7 PASS: Invalid JWT token correctly rejected with 401 Unauthorized");

        console.log("\nALL STUDENT DASHBOARD & UNIVERSITY FINDER TESTS PASSED SUCCESSFULLY! 🎉");
    } catch (err) {
        console.error("\n❌ STUDENT DASHBOARD TEST FAILED:", err);
        process.exitCode = 1;
    } finally {
        server.close();
    }
});
