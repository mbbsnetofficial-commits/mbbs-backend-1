"use strict";

const http = require("http");
const assert = require("assert");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = require("../app");
const Auth = require("../model/neet-models/auth");
const DeviceToken = require("../model/neet-models/deviceToken");
const Notification = require("../model/neet-models/notification");

require("dotenv").config({ path: "config/config.env" });

console.log("=== Running FCM Notification & Device Token Tests ===");

const TEST_SECRET = process.env.SECRET_KEY || "test-secret-key-12345";
process.env.SECRET_KEY = TEST_SECRET;

const makeRequest = (port, path, method = "GET", headers = {}, body = null) => {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const reqHeaders = { ...headers };
        if (payload) {
            reqHeaders["Content-Type"] = "application/json";
            reqHeaders["Content-Length"] = Buffer.byteLength(payload);
        }

        const req = http.request(
            {
                hostname: "127.0.0.1",
                port,
                path,
                method,
                headers: reqHeaders
            },
            res => {
                let data = "";
                res.on("data", chunk => (data += chunk));
                res.on("end", () => {
                    let parsed = null;
                    try {
                        parsed = JSON.parse(data);
                    } catch {
                        parsed = data;
                    }
                    resolve({ statusCode: res.statusCode, headers: res.headers, body: parsed });
                });
            }
        );

        req.on("error", reject);
        if (payload) req.write(payload);
        req.end();
    });
};

(async () => {
    try {
        const connStr = process.env.CONNECTION_STRING;
        if (connStr && mongoose.connection.readyState === 0) {
            await mongoose.connect(connStr);
            console.log("✔ Connected to MongoDB for FCM tests");
        }

        const testUser = await Auth.findOneAndUpdate(
            { email: "fcm_test_student@mbbs.net" },
            {
                $set: {
                    email: "fcm_test_student@mbbs.net",
                    student_id: "STU_FCM_TEST_01",
                    is_active: true
                }
            },
            { upsert: true, returnDocument: "after" }
        );

        const token = jwt.sign(
            { id: testUser._id.toString(), student_id: testUser.student_id },
            TEST_SECRET,
            { algorithm: "HS256", expiresIn: "1h" }
        );

        const authHeaders = { Authorization: `Bearer ${token}` };

        const server = http.createServer(app);
        await new Promise(res => server.listen(0, res));
        const port = server.address().port;

        // Test 1: Unauthenticated request rejected
        const res1 = await makeRequest(port, "/api/v1/notifications/device-token", "POST", {}, {
            token: "fcm_dummy_token_123"
        });
        assert.strictEqual(res1.statusCode, 401, "Should require authentication");
        console.log("✔ Test 1 PASS: Unauthenticated device-token registration rejected (401)");

        // Test 2: Missing token validation
        const res2 = await makeRequest(port, "/api/v1/notifications/device-token", "POST", authHeaders, {
            deviceType: "android"
        });
        assert.strictEqual(res2.statusCode, 400, "Should reject empty token");
        console.log("✔ Test 2 PASS: Empty token rejected with 400");

        // Test 3: Valid device token registration
        const testFcmToken = "fcm_test_token_device_alpha_987";
        const res3 = await makeRequest(port, "/api/v1/notifications/device-token", "POST", authHeaders, {
            token: testFcmToken,
            deviceType: "android",
            deviceId: "android_pixel_8",
            appVersion: "1.0.0"
        });
        assert.strictEqual(res3.statusCode, 200, "Should register successfully");
        assert.strictEqual(res3.body.success, true);
        const storedToken = await DeviceToken.findOne({ token: testFcmToken });
        assert.ok(storedToken, "Token should be stored in MongoDB");
        assert.strictEqual(storedToken.is_active, true);
        assert.strictEqual(storedToken.device_type, "android");
        console.log("✔ Test 3 PASS: Registered FCM device token in MongoDB");

        // Test 4: Multi-device registration for same user
        const secondFcmToken = "fcm_test_token_device_beta_456";
        const res4 = await makeRequest(port, "/api/v1/notifications/device-token", "POST", authHeaders, {
            token: secondFcmToken,
            deviceType: "android",
            deviceId: "android_samsung_s24",
            appVersion: "1.0.1"
        });
        assert.strictEqual(res4.statusCode, 200);
        const activeTokens = await DeviceToken.find({ user_id: testUser._id, is_active: true });
        assert.ok(activeTokens.length >= 2, "User should have multiple active device tokens");
        console.log("✔ Test 4 PASS: Multi-device tokens registered and active for same user");

        // Test 5: Deactivate device token
        const res5 = await makeRequest(port, "/api/v1/notifications/device-token", "DELETE", authHeaders, {
            token: testFcmToken
        });
        assert.strictEqual(res5.statusCode, 200);
        const deactivatedRecord = await DeviceToken.findOne({ token: testFcmToken });
        assert.strictEqual(deactivatedRecord.is_active, false);
        console.log("✔ Test 5 PASS: Deactivated specific device token successfully");

        // Test 6: Send direct notification API validation
        const res6 = await makeRequest(port, "/api/v1/notifications/send", "POST", authHeaders, {
            userId: testUser._id.toString(),
            title: "Mock Test Live",
            body: "Your Botany Mock Test is live now!",
            type: "TEST",
            data: { testId: "test_123" }
        });
        assert.strictEqual(res6.statusCode, 200);
        assert.strictEqual(res6.body.success, true);
        console.log("✔ Test 6 PASS: Notification send endpoint executed cleanly");

        // Cleanup
        await DeviceToken.deleteMany({ token: { $in: [testFcmToken, secondFcmToken] } });
        server.close();

        console.log("\nALL FCM NOTIFICATION TESTS PASSED SUCCESSFULLY! 🎉\n");
        process.exit(0);
    } catch (err) {
        console.error("❌ FCM Test Failed:", err);
        process.exit(1);
    }
})();
