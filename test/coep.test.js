"use strict";

const http = require("http");
const assert = require("assert");
const app = require("../app");

console.log("=== Running Cross-Origin-Embedder-Policy (COEP) Tests ===");

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
        // Test 1: GET / receives Cross-Origin-Embedder-Policy header
        let res = await makeRequest("/");
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(
            res.headers["cross-origin-embedder-policy"],
            "require-corp",
            "COEP header must equal 'require-corp' on GET /"
        );
        console.log("✔ Test 1 PASS: COEP header present on GET / (require-corp)");

        // Test 2: GET /health receives COEP header
        res = await makeRequest("/health");
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(
            res.headers["cross-origin-embedder-policy"],
            "require-corp",
            "COEP header must equal 'require-corp' on GET /health"
        );
        console.log("✔ Test 2 PASS: COEP header present on GET /health (require-corp)");

        // Test 3: GET /api-docs receives COEP header
        res = await makeRequest("/api-docs");
        assert.strictEqual(
            res.headers["cross-origin-embedder-policy"],
            "require-corp",
            "COEP header must equal 'require-corp' on GET /api-docs"
        );
        console.log("✔ Test 3 PASS: COEP header present on GET /api-docs (require-corp)");

        // Test 4: POST /api/v1/auth/login receives COEP header
        res = await makeRequest("/api/v1/auth/login", "POST");
        assert.strictEqual(
            res.headers["cross-origin-embedder-policy"],
            "require-corp",
            "COEP header must equal 'require-corp' on API routes"
        );
        console.log("✔ Test 4 PASS: COEP header present on API endpoints (require-corp)");

        console.log("\nALL COEP TESTS PASSED SUCCESSFULLY! 🎉");
    } catch (err) {
        console.error("\n❌ COEP TEST FAILED:", err);
        process.exitCode = 1;
    } finally {
        server.close();
    }
});
