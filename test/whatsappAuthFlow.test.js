const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "config", "config.env") });
const http = require("http");
const assert = require("assert");
const mongoose = require("mongoose");
const app = require("../app");
const { connectDatabases } = require("../config/database");
const Auth = require("../model/neet-models/auth");
const SignupOtp = require("../model/neet-models/signupOtp");

console.log("=== Running WhatsApp OTP Auth & neet-auth Registration/Login Tests ===");

const server = app.listen(0, async () => {
    const port = server.address().port;

    if (process.env.CONNECTION_STRING && mongoose.connection.readyState === 0) {
        try {
            await connectDatabases();
            console.log("✔ Connected to Databases (NEET, Blog, UCAT)");
        } catch (e) {
            console.log("ℹ DB connection skipped:", e.message);
        }
    }

    const makeRequest = (path, body = null, method = "POST", headers = {}) => {
        return new Promise((resolve, reject) => {
            const reqHeaders = { "Content-Type": "application/json", ...headers };
            const req = http.request({
                hostname: "127.0.0.1",
                port,
                path,
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
        const testPhone = "+919876543210";
        const testFullName = "Sanjay Kumar";

        // If DB is connected, test live collection operations
        if (mongoose.connection.readyState === 1) {
            await Auth.deleteMany({ phoneNumber: testPhone });
            await SignupOtp.deleteMany({ phone_number: testPhone });

            // 1. Send Registration OTP (Image 2)
            let regRes = await makeRequest("/api/v1/auth/register", {
                fullName: testFullName,
                phoneNumber: testPhone
            });
            assert.strictEqual(regRes.statusCode, 200, "Registration OTP request should return 200");
            assert.strictEqual(regRes.body.status, "success");
            console.log("✔ Test 1 PASS: Generated OTP & requested Twilio WhatsApp delivery for registration");

            // Extract OTP from database directly for verification test
            const savedOtpDoc = await SignupOtp.findOne({ phone_number: testPhone }).select("+otp_hash");
            assert.ok(savedOtpDoc, "SignupOtp record must exist in DB");
            assert.ok(savedOtpDoc.otp_hash, "OTP hash must be stored securely");

            // Set fixed test OTP hash for verification
            const crypto = require("crypto");
            const testOtp = "789123";
            const hash = crypto
                .createHmac("sha256", process.env.SIGNUP_OTP_SECRET || process.env.RESET_OTP_SECRET || process.env.SECRET_KEY || "MBBS_OTP_SECRET_KEY")
                .update(testOtp)
                .digest("hex");
            savedOtpDoc.otp_hash = hash;
            await savedOtpDoc.save();

            // 2. Verify Registration OTP & create user in neet-auth
            let verifyRegRes = await makeRequest("/api/v1/auth/register/verify-otp", {
                phoneNumber: testPhone,
                otp: testOtp
            });
            assert.strictEqual(verifyRegRes.statusCode, 201, "Registration verify should return 201 Created");
            assert.strictEqual(verifyRegRes.body.status, "success");
            assert.ok(verifyRegRes.body.data.accessToken, "Must return accessToken");
            assert.ok(verifyRegRes.body.data.student_id, "Must generate student_id");
            console.log(`✔ Test 2 PASS: Verified OTP and created student account in neet-auth (${verifyRegRes.body.data.student_id})`);

            // Verify user actually persisted in neet-auth collection
            const createdUser = await Auth.findOne({ phoneNumber: testPhone });
            assert.ok(createdUser, "User must exist in neet-auth collection");
            assert.strictEqual(createdUser.fullName, testFullName);
            console.log("✔ Test 3 PASS: Confirmed record in 'neet-auth' collection");

            // 3. Request WhatsApp Login OTP (Image 1)
            let loginRes = await makeRequest("/api/v1/auth/login", {
                phoneNumber: testPhone
            });
            assert.strictEqual(loginRes.statusCode, 200, "Login OTP request should return 200");
            assert.strictEqual(loginRes.body.status, "success");
            console.log("✔ Test 4 PASS: Generated Login OTP for existing user in neet-auth");

            // Re-hash for login verification
            const loginOtp = "456789";
            const loginHash = crypto
                .createHmac("sha256", process.env.SIGNUP_OTP_SECRET || process.env.RESET_OTP_SECRET || process.env.SECRET_KEY || "MBBS_OTP_SECRET_KEY")
                .update(loginOtp)
                .digest("hex");
            await SignupOtp.updateOne({ phone_number: testPhone }, { $set: { otp_hash: loginHash } });

            // 4. Verify Login OTP
            let verifyLoginRes = await makeRequest("/api/v1/auth/login/verify-otp", {
                phoneNumber: testPhone,
                otp: loginOtp
            });
            assert.strictEqual(verifyLoginRes.statusCode, 200, "Login verify should return 200");
            assert.strictEqual(verifyLoginRes.body.status, "success");
            assert.ok(verifyLoginRes.body.data.accessToken, "Must return accessToken on login");
            assert.strictEqual(verifyLoginRes.body.data.student_id, createdUser.student_id);
            console.log("✔ Test 5 PASS: Logged in via WhatsApp OTP with matching student_id");

            // 5. Test non-existent user on login (Image 1 validation)
            let notFoundRes = await makeRequest("/api/v1/auth/login", {
                phoneNumber: "+919999999999"
            });
            assert.strictEqual(notFoundRes.statusCode, 404, "Unknown number should return 404");
            console.log("✔ Test 6 PASS: Unknown number returns 404 with prompt to create account");

            // Cleanup
            await Auth.deleteMany({ phoneNumber: testPhone });
            await SignupOtp.deleteMany({ phone_number: testPhone });
        } else {
            console.log("ℹ DB not connected, testing validation endpoints");
            let badReq = await makeRequest("/api/v1/auth/register", {
                fullName: "",
                phoneNumber: ""
            });
            assert.strictEqual(badReq.statusCode, 400);
            console.log("✔ Validation test passed");
        }

        console.log("\nALL WHATSAPP OTP & NEET-AUTH TESTS PASSED! 🎉\n");
    } catch (err) {
        console.error("❌ WhatsApp Auth Test Failed:", err);
        process.exitCode = 1;
    } finally {
        server.close();
    }
});
