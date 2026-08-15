"use strict";

const assert = require("assert");
const learningReportService = require("../services/learningReport.service");

console.log("=== Testing NEET Dashboard KPI Process Calculations ===");

const runKpiUnitTests = async () => {
    // Test 1: Null or empty studentId returns structured 0 metrics
    const emptyResult = await learningReportService.getNeetSummary(null);
    assert.strictEqual(emptyResult.status, "success");
    assert.strictEqual(emptyResult.data.total_time_spent, "0m");
    assert.strictEqual(emptyResult.data.average_score, "0 / 720");
    assert.strictEqual(emptyResult.data.completed_tests, 0);
    assert.strictEqual(emptyResult.data.current_streak, 0);
    assert.strictEqual(emptyResult.data.build_test_cta, "Build your own test");
    console.log("✔ Test 1 PASS: Empty/new student KPI metrics return valid zeros");

    // Test 2: Formatting helper tests
    const defs = learningReportService.BUILTIN_TEST_DEFINITIONS;
    assert.strictEqual(defs.length, 5);
    for (const d of defs) {
        assert.strictEqual(d.total_marks, 720);
        assert.strictEqual(d.total_questions, 180);
    }
    console.log("✔ Test 2 PASS: Built-in test schema definitions valid");

    console.log("\nALL KPI PROCESS UNIT TESTS PASSED SUCCESSFULLY! 🎉\n");
};

runKpiUnitTests()
    .then(() => process.exit(0))
    .catch(err => {
        console.error("❌ KPI Unit Test Failed:", err);
        process.exit(1);
    });
