"use strict";

const http = require("http");
const assert = require("assert");
const app = require("../app");
const authController = require("../controllers/neet-controller/auth.contorllers");
const { permanentlyDeleteUserAccount } = require("../services/accountDeletion.service");

console.log("=== Running Delete Account Unit & Route Verification Tests ===");

// 1. Verify controller and service exports
assert.strictEqual(typeof authController.deleteAccount, "function", "authController.deleteAccount must be a function");
assert.strictEqual(typeof permanentlyDeleteUserAccount, "function", "permanentlyDeleteUserAccount must be a function");
console.log("✔ Test 1 PASS: authController.deleteAccount and permanentlyDeleteUserAccount functions exported correctly");

const server = app.listen(0, async () => {
    const port = server.address().port;

    const makeRequest = (reqPath, body = null, method = "DELETE", headers = {}) => {
        return new Promise((resolve, reject) => {
            const reqHeaders = { "Content-Type": "application/json", ...headers };
            const req = http.request({
                hostname: "127.0.0.1",
                port,
                path: reqPath,
                method,
                headers: reqHeaders
            }, (res) => {
                let data = "";
                res.on("data", chunk => data += chunk);
                res.on("end", () => {
                    let parsed = null;
                    try { parsed = JSON.parse(data); } catch { parsed = data; }
                    resolve({
                        statusCode: res.statusCode,
                        body: parsed
                    });
                });
            });
            req.on("error", reject);
            if (body) req.write(JSON.stringify(body));
            req.end();
        });
    };

    try {
        // Test 2: Unauthenticated DELETE /api/v1/auth/delete-account returns 401
        const unauthDeleteRes = await makeRequest("/api/v1/auth/delete-account", {}, "DELETE");
        assert.strictEqual(unauthDeleteRes.statusCode, 401, "Unauthenticated DELETE must return 401");
        assert.strictEqual(unauthDeleteRes.body.status, "fail");
        console.log("✔ Test 2 PASS: Unauthenticated DELETE /api/v1/auth/delete-account blocked with 401");

        // Test 3: Unauthenticated POST /api/v1/auth/delete-account returns 401
        const unauthPostRes = await makeRequest("/api/v1/auth/delete-account", {}, "POST");
        assert.strictEqual(unauthPostRes.statusCode, 401, "Unauthenticated POST must return 401");
        assert.strictEqual(unauthPostRes.body.status, "fail");
        console.log("✔ Test 3 PASS: Unauthenticated POST /api/v1/auth/delete-account blocked with 401");

        // Test 4: Unauthenticated DELETE /api/v1/auth/account returns 401
        const unauthAccountRes = await makeRequest("/api/v1/auth/account", {}, "DELETE");
        assert.strictEqual(unauthAccountRes.statusCode, 401, "Unauthenticated DELETE /api/v1/auth/account must return 401");
        assert.strictEqual(unauthAccountRes.body.status, "fail");
        console.log("✔ Test 4 PASS: Unauthenticated DELETE /api/v1/auth/account blocked with 401");

        // Test 5: Invalid Bearer token returns 401
        const invalidTokenRes = await makeRequest(
            "/api/v1/auth/delete-account",
            {},
            "DELETE",
            { Authorization: "Bearer invalid.token.payload" }
        );
        assert.strictEqual(invalidTokenRes.statusCode, 401, "Invalid token must return 401");
        console.log("✔ Test 5 PASS: Invalid Bearer token blocked with 401");

        console.log("\nALL DELETE ACCOUNT UNIT & ROUTE TESTS PASSED SUCCESSFULLY! 🎉\n");
    } catch (err) {
        console.error("❌ Test failure:", err);
        process.exitCode = 1;
    } finally {
        server.close();
        process.exit(process.exitCode || 0);
    }
});
