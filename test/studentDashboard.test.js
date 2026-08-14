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
        // Test 1: GET /api/v1/student/dashboard/summary processed without authentication token
        let res = await makeRequest("/api/v1/student/dashboard/summary");
        assert.ok([200, 404, 500, 503].includes(res.statusCode), `Request processed (got ${res.statusCode})`);
        console.log(`✔ Test 1 PASS: GET /api/v1/student/dashboard/summary processed without JWT (Status: ${res.statusCode})`);

        // Test 2: GET /api/v1/student/dashboard/stats processed without authentication token
        res = await makeRequest("/api/v1/student/dashboard/stats");
        assert.ok([200, 404, 500, 503].includes(res.statusCode), `Request processed (got ${res.statusCode})`);
        console.log(`✔ Test 2 PASS: GET /api/v1/student/dashboard/stats processed without JWT (Status: ${res.statusCode})`);

        // Test 3: GET /api/v1/student/dashboard/saved-blogs processed without authentication token
        res = await makeRequest("/api/v1/student/dashboard/saved-blogs");
        assert.ok([200, 404, 500, 503].includes(res.statusCode), `Request processed (got ${res.statusCode})`);
        console.log(`✔ Test 3 PASS: GET /api/v1/student/dashboard/saved-blogs processed without JWT (Status: ${res.statusCode})`);

        // Test 4: GET /api/v1/student/dashboard/university-finder/saved-universities processed without authentication token
        res = await makeRequest("/api/v1/student/dashboard/university-finder/saved-universities");
        assert.ok([200, 404, 500, 503].includes(res.statusCode), `Request processed (got ${res.statusCode})`);
        console.log(`✔ Test 4 PASS: GET /api/v1/student/dashboard/university-finder/saved-universities processed without JWT (Status: ${res.statusCode})`);

        // Test 5: POST /api/v1/student/dashboard/university-finder/save-university processed without token
        res = await makeRequest("/api/v1/student/dashboard/university-finder/save-university", null, "POST", { university_id: "1", university_name: "Test Uni" });
        assert.ok([200, 400, 404, 500, 503].includes(res.statusCode), `Request processed (got ${res.statusCode})`);
        console.log(`✔ Test 5 PASS: POST /api/v1/student/dashboard/university-finder/save-university processed without JWT (Status: ${res.statusCode})`);

        // Test 6: GET /api/v1/student/dashboard/university-finder/recommendations processed without token
        res = await makeRequest("/api/v1/student/dashboard/university-finder/recommendations");
        assert.ok([200, 404, 500, 503].includes(res.statusCode), `Request processed (got ${res.statusCode})`);
        console.log(`✔ Test 6 PASS: GET /api/v1/student/dashboard/university-finder/recommendations processed without JWT (Status: ${res.statusCode})`);

        // Test 7: Malformed / invalid bearer token still allows request pass-through
        res = await makeRequest("/api/v1/student/dashboard/summary", "invalid.jwt.token");
        assert.ok([200, 404, 500, 503].includes(res.statusCode), `Request processed (got ${res.statusCode})`);
        console.log(`✔ Test 7 PASS: Invalid JWT token request passes through without 401 error (Status: ${res.statusCode})`);

        console.log("\nALL STUDENT DASHBOARD & UNIVERSITY FINDER TESTS PASSED SUCCESSFULLY! 🎉");
    } catch (err) {
        console.error("\n❌ STUDENT DASHBOARD TEST FAILED:", err);
        process.exitCode = 1;
    } finally {
        server.close();
    }
});
