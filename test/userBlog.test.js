"use strict";

const assert = require("assert");
const http = require("http");
const app = require("../app");

const runTestServer = () => new Promise(resolve => {
    const server = http.createServer(app);
    server.listen(0, "127.0.0.1", () => {
        const port = server.address().port;
        resolve({ server, port });
    });
});

const makeRequest = (port, path, headers = {}) => new Promise((resolve, reject) => {
    const req = http.request({
        host: "127.0.0.1",
        port,
        path,
        method: "GET",
        headers
    }, res => {
        let body = "";
        res.on("data", chunk => { body += chunk; });
        res.on("end", () => {
            try {
                resolve({ status: res.statusCode, data: JSON.parse(body) });
            } catch (_) {
                resolve({ status: res.statusCode, body });
            }
        });
    });
    req.on("error", reject);
    req.end();
});

(async () => {
    console.log("=== Running User-Side Blog API Integration Tests ===");
    const { server, port } = await runTestServer();

    try {
        // Test 1: Unauthenticated Guest GET /api/v1/blogs passes authentication middleware
        const res1 = await makeRequest(port, "/api/v1/blogs");
        assert.notStrictEqual(res1.status, 401, "Guest GET /api/v1/blogs must NOT return 401 Unauthorized");
        assert([200, 500].includes(res1.status), "Guest GET /api/v1/blogs should reach database layer (Status: 200 or 500 when offline)");
        console.log("✔ Test 1 PASS: Unauthenticated guest can reach user-side blog route without 401 Unauthorized (Status: " + res1.status + ")");

        // Test 2: Unauthenticated Guest GET /api/v1/blogs with URL slug
        const res2 = await makeRequest(port, "/api/v1/blogs/complete-neet-biology-guide");
        assert.notStrictEqual(res2.status, 401, "GET /api/v1/blogs/:slug must NOT return 401 Unauthorized");
        assert.notStrictEqual(res2.status, 400, "URL slug must NOT be rejected by Joi schema validation (400)");
        console.log("✔ Test 2 PASS: URL slug lookup passes validation without 401 or 400 (Status: " + res2.status + ")");

        console.log("\nALL USER-SIDE BLOG TESTS PASSED SUCCESSFULLY! 🎉");
    } catch (err) {
        console.error("❌ Test failed:", err.message);
        process.exit(1);
    } finally {
        server.close();
    }
})();
