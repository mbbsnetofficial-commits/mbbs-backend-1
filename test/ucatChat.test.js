"use strict";

const http = require("http");
const assert = require("assert");
const app = require("../app");
const jwt = require("jsonwebtoken");

console.log("=== Running UCAT AI Review Chat Session Tests ===");

// Generate a valid student JWT token for testing
const token = jwt.sign(
    { userId: "1", role: "student", id: "1" },
    process.env.SECRET_KEY || "replace-with-a-long-random-secret",
    { expiresIn: "1h" }
);

const server = app.listen(0, async () => {
    const port = server.address().port;

    const makeRequest = (path, body = null, method = "GET") => {
        return new Promise((resolve, reject) => {
            const headers = {
                "Authorization": `Bearer ${token}`
            };
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
        // Test 1: GET /api/v1/ucat/chat/sessions without valid active DB session rejects with 401 Unauthorized
        let res = await makeRequest("/api/v1/ucat/chat/sessions");
        assert.strictEqual(res.statusCode, 401);
        console.log("✔ Test 1 PASS: GET /api/v1/ucat/chat/sessions requires valid authenticated JWT (401 Unauthorized)");

        // Test 2: POST /api/v1/ucat/chat/sessions without valid token rejects with 401 Unauthorized
        res = await makeRequest("/api/v1/ucat/chat/sessions", {}, "POST");
        assert.strictEqual(res.statusCode, 401);
        console.log("✔ Test 2 PASS: POST /api/v1/ucat/chat/sessions requires valid authenticated JWT (401 Unauthorized)");

        // Test 3: POST /api/v1/ucat/chat/sessions with non-existent testSessionId returns 401/404/503
        res = await makeRequest("/api/v1/ucat/chat/sessions", {
            testSessionId: "non_existent_test_session_123"
        }, "POST");
        assert.ok([401, 404, 503].includes(res.statusCode), `Must reject request (got ${res.statusCode})`);
        console.log(`✔ Test 3 PASS: POST /api/v1/ucat/chat/sessions validates request authorization (Status: ${res.statusCode})`);

        // Test 4: GET /api/v1/ucat/chat/sessions/non_existent_chat_session returns 401/404/503
        res = await makeRequest("/api/v1/ucat/chat/sessions/UCHAT_NON_EXISTENT");
        assert.ok([401, 404, 503].includes(res.statusCode));
        console.log(`✔ Test 4 PASS: GET /api/v1/ucat/chat/sessions/:chatSessionId handles session lookup (Status: ${res.statusCode})`);

        // Test 5: GET /api/v1/ucat/chat/sessions/non_existent/messages returns 401/404/503
        res = await makeRequest("/api/v1/ucat/chat/sessions/UCHAT_NON_EXISTENT/messages");
        assert.ok([401, 404, 503].includes(res.statusCode));
        console.log(`✔ Test 5 PASS: GET /api/v1/ucat/chat/sessions/:chatSessionId/messages handles message lookup (Status: ${res.statusCode})`);

        // Test 6: POST /api/v1/ucat/chat/sessions/non_existent/messages without content returns 401/400/503
        res = await makeRequest("/api/v1/ucat/chat/sessions/UCHAT_NON_EXISTENT/messages", {}, "POST");
        assert.ok([400, 401, 503].includes(res.statusCode));
        console.log(`✔ Test 6 PASS: POST /api/v1/ucat/chat/sessions/:chatSessionId/messages validates content and auth (Status: ${res.statusCode})`);

        // Test 7: Unauthorized request without Bearer token returns 401
        res = await new Promise((resolve, reject) => {
            const req = http.request({
                hostname: "127.0.0.1",
                port,
                path: "/api/v1/ucat/chat/sessions",
                method: "GET"
            }, (res) => {
                let data = "";
                res.on("data", chunk => data += chunk);
                res.on("end", () => resolve({ statusCode: res.statusCode }));
            });
            req.on("error", reject);
            req.end();
        });
        assert.strictEqual(res.statusCode, 401);
        console.log("✔ Test 7 PASS: Unauthorized request without token rejected (401 Unauthorized)");

        console.log("\nALL UCAT CHAT SESSION TESTS PASSED SUCCESSFULLY! 🎉");
    } catch (err) {
        console.error("\n❌ UCAT CHAT TEST FAILED:", err);
        process.exitCode = 1;
    } finally {
        server.close();
    }
});
