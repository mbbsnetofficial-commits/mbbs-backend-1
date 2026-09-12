"use strict";

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "config", "config.env") });
const http = require("http");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = require("../app");
const { connectDatabases } = require("../config/database");
const Auth = require("../model/neet-models/auth");
const DeviceToken = require("../model/neet-models/deviceToken");
const Notification = require("../model/neet-models/notification");

const TEST_SECRET = process.env.SECRET_KEY || "test-secret-key-12345";
process.env.SECRET_KEY = TEST_SECRET;

// HTTP Agent with keep-alive for accurate high-throughput simulation
const agent = new http.Agent({
    keepAlive: true,
    maxSockets: 1000,
    maxFreeSockets: 256,
    timeout: 30000
});

const sendRequest = (port, reqPath, method = "GET", headers = {}, body = null) => {
    return new Promise((resolve) => {
        const payload = body ? JSON.stringify(body) : null;
        const reqHeaders = { ...headers };
        if (payload) {
            reqHeaders["Content-Type"] = "application/json";
            reqHeaders["Content-Length"] = Buffer.byteLength(payload);
        }

        const start = process.hrtime.bigint();
        const req = http.request(
            {
                hostname: "127.0.0.1",
                port,
                path: reqPath,
                method,
                agent,
                headers: reqHeaders
            },
            (res) => {
                let data = "";
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => {
                    const diffNs = process.hrtime.bigint() - start;
                    const durationMs = Number(diffNs) / 1e6;
                    resolve({
                        statusCode: res.statusCode,
                        durationMs,
                        success: res.statusCode >= 200 && res.statusCode < 400
                    });
                });
            }
        );

        req.on("error", (err) => {
            const diffNs = process.hrtime.bigint() - start;
            resolve({
                statusCode: 0,
                durationMs: Number(diffNs) / 1e6,
                success: false,
                error: err.message
            });
        });

        if (payload) req.write(payload);
        req.end();
    });
};

const runTier = async (name, port, headers, concurrency, durationSeconds) => {
    console.log(`\n▶ Running [${name}] - Concurrency: ${concurrency} VUs, Duration: ${durationSeconds}s ...`);

    const endpoints = [
        { path: "/health", method: "GET", body: null, auth: false },
        { path: "/api/v1/notifications/unread-count", method: "GET", body: null, auth: true },
        { path: "/api/v1/notifications", method: "GET", body: null, auth: true },
        { path: "/api/v1/ucat/streaks", method: "GET", body: null, auth: true }
    ];

    const latencies = [];
    let successes = 0;
    let failures = 0;
    const startTime = Date.now();
    const endTime = startTime + durationSeconds * 1000;

    const worker = async (workerId) => {
        while (Date.now() < endTime) {
            const ep = endpoints[(workerId + latencies.length) % endpoints.length];
            const reqHeaders = ep.auth ? headers : {};
            const res = await sendRequest(port, ep.path, ep.method, reqHeaders, ep.body);
            latencies.push(res.durationMs);
            if (res.success) {
                successes++;
            } else {
                failures++;
            }
        }
    };

    // Launch concurrent virtual users
    const workers = [];
    for (let i = 0; i < concurrency; i++) {
        workers.push(worker(i));
    }
    await Promise.all(workers);

    const actualDurationSec = (Date.now() - startTime) / 1000;
    const totalRequests = successes + failures;
    const rps = (totalRequests / actualDurationSec).toFixed(1);

    latencies.sort((a, b) => a - b);
    const avgLatency = (latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1)).toFixed(2);
    const p50 = (latencies[Math.floor(latencies.length * 0.5)] || 0).toFixed(2);
    const p95 = (latencies[Math.floor(latencies.length * 0.95)] || 0).toFixed(2);
    const p99 = (latencies[Math.floor(latencies.length * 0.99)] || 0).toFixed(2);
    const successRate = ((successes / (totalRequests || 1)) * 100).toFixed(2);

    console.log(`  📊 Requests Completed: ${totalRequests} (${rps} req/sec)`);
    console.log(`  ⏱️  Latency: Avg=${avgLatency}ms | p50=${p50}ms | p95=${p95}ms | p99=${p99}ms`);
    console.log(`  ✅ Success Rate: ${successRate}% (${successes} ok, ${failures} errors)`);

    return {
        name,
        concurrency,
        totalRequests,
        rps: Number(rps),
        avgLatency: Number(avgLatency),
        p50: Number(p50),
        p95: Number(p95),
        p99: Number(p99),
        successRate: Number(successRate)
    };
};

(async () => {
    console.log("=========================================================");
    console.log("⚡ MBBS BACKEND LOAD & CAPACITY BENCHMARK TEST");
    console.log("=========================================================");

    let server = null;

    try {
        await connectDatabases();
        console.log("✔ Connected to MongoDB instances");

        server = http.createServer(app);
        await new Promise((res) => server.listen(0, res));
        const port = server.address().port;
        console.log(`✔ In-memory test server listening on port ${port}`);

        // Create mock student with active notifications
        const studentId = `STU_LOAD_${Date.now()}`;
        const user = await Auth.findOneAndUpdate(
            { email: "load_test_user@mbbs.net" },
            {
                $set: {
                    email: "load_test_user@mbbs.net",
                    student_id: studentId,
                    fullName: "Load Test Student",
                    phoneNumber: "+919876500000",
                    is_active: true
                }
            },
            { upsert: true, returnDocument: "after" }
        );

        // Pre-populate 5 notifications for realistic database read load
        for (let i = 1; i <= 5; i++) {
            await Notification.create({
                user_id: user._id,
                student_id: studentId,
                title: `Notification #${i}`,
                message: `This is test message #${i} for load testing.`,
                notification_type: "general",
                priority: "normal"
            });
        }

        const token = jwt.sign(
            { id: user._id.toString(), student_id: user.student_id },
            TEST_SECRET,
            { algorithm: "HS256", expiresIn: "24h" }
        );
        const authHeaders = { Authorization: `Bearer ${token}` };

        // Warm up
        console.log("\n⏳ Warming up JIT and database connection pools...");
        await runTier("Warmup Tier", port, authHeaders, 20, 3);

        // Actual benchmark tiers
        const tier1 = await runTier("Tier 1: Light Traffic (50 VUs)", port, authHeaders, 50, 5);
        const tier2 = await runTier("Tier 2: Moderate Traffic (100 VUs)", port, authHeaders, 100, 5);
        const tier3 = await runTier("Tier 3: Heavy Traffic (250 VUs)", port, authHeaders, 250, 5);
        const tier4 = await runTier("Tier 4: Peak Stress (500 VUs)", port, authHeaders, 500, 5);

        // Cleanup
        await Notification.deleteMany({ student_id: studentId });
        await Auth.deleteOne({ _id: user._id });

        // Calculate Capacity Estimation
        const peakRps = Math.max(tier1.rps, tier2.rps, tier3.rps, tier4.rps);
        // Standard user makes ~0.2 req/sec (1 request every 5 seconds) while actively using the app
        const concurrentActiveUsers = Math.round(peakRps / 0.2);
        // Daily Active Users (DAU) assuming average active session length & peak ratio (10:1 ratio)
        const estimatedDau = concurrentActiveUsers * 15;

        console.log("\n=========================================================");
        console.log("📈 FINAL CAPACITY & USER HANDLING REPORT");
        console.log("=========================================================");
        console.log(`• Maximum Measured Throughput: ${peakRps.toLocaleString()} requests/second`);
        console.log(`• Typical P95 Response Time:    ${tier2.p95}ms (under 100 concurrent VUs)`);
        console.log(`• Concurrent Active Users:     ~${concurrentActiveUsers.toLocaleString()} concurrent active users`);
        console.log(`• Estimated Daily Active Users: ~${estimatedDau.toLocaleString()} DAU (Single Instance)`);
        console.log("=========================================================\n");

        process.exit(0);
    } catch (err) {
        console.error("❌ Load Test Runner Error:", err);
        process.exit(1);
    } finally {
        if (server) server.close();
    }
})();
