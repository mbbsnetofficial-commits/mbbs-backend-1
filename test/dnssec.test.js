"use strict";

const assert = require("assert");
const { verifyDnssec } = require("../scripts/checkDnssec");

console.log("=== Running DNSSEC Verification Tooling Tests ===");

async function runTests() {
    try {
        // Test 1: Verify DNSSEC inspection on a known DNSSEC-enabled domain (cloudflare.com)
        console.log("Testing DNSSEC check on cloudflare.com...");
        const resEnabled = await verifyDnssec("cloudflare.com");
        assert.strictEqual(resEnabled.domain, "cloudflare.com");
        assert.strictEqual(typeof resEnabled.hasDS, "boolean");
        assert.strictEqual(resEnabled.hasDS, true, "cloudflare.com must have DNSSEC DS records enabled");
        console.log("✔ Test 1 PASS: Successfully identified active DNSSEC DS records on cloudflare.com");

        // Test 2: Verify DNSSEC inspection logic on target domain (mbbs.net)
        console.log("Testing DNSSEC check on target domain mbbs.net...");
        const resTarget = await verifyDnssec("mbbs.net");
        assert.strictEqual(resTarget.domain, "mbbs.net");
        assert.strictEqual(typeof resTarget.hasDS, "boolean");
        assert.ok(Array.isArray(resTarget.records), "Records property must be an array");
        console.log(`✔ Test 2 PASS: Successfully queried DNSSEC status for mbbs.net (hasDS: ${resTarget.hasDS})`);

        console.log("\nALL DNSSEC TOOLING TESTS PASSED SUCCESSFULLY! 🎉");
    } catch (err) {
        console.error("\n❌ DNSSEC TOOLING TEST FAILED:", err);
        process.exitCode = 1;
    }
}

runTests();
