/**
 * Test Runner
 * Executes all test suites and aggregates results
 */

/**
 * Main test runner function
 * Run this from the Apps Script IDE to execute all tests
 */
function runAllTests() {
  Logger.log('======================================');
  Logger.log('Running All Tests');
  Logger.log('======================================');

  const allResults = [];

  // Run test helper tests
  Logger.log('\n--- Testing Test Helpers ---');
  allResults.push(...runTestSuite('TestHelpers', [
    testAssertEqual,
    testAssertContains,
    testFail
  ]));

  // Run Fireflies API tests
  Logger.log('\n--- Testing Fireflies API ---');
  allResults.push(...runTestSuite('FirefliesAPI', [
    testParseFirefliesResponse,
    testBuildFirefliesGraphQLQuery
  ]));

  // Run Gmail API tests
  Logger.log('\n--- Testing Gmail API ---');
  allResults.push(...runTestSuite('GmailAPI', [
    testBuildGmailSearchQuery,
    testParseGmailThreads,
    testFormatGmailDate
  ]));

  // Run SheetConfig tests
  Logger.log('\n--- Testing SheetConfig ---');
  allResults.push(...runTestSuite('SheetConfig', [
    testGetOpportunityConfigs,
    testUpdateLastSyncDate,
    testUpdateOpportunityStatus,
    testGetSheetByName,
    testFormatSyncDate
  ]));

  // Print summary
  Logger.log('\n======================================');
  printTestSummary(allResults);
  Logger.log('======================================');

  return allResults;
}

/**
 * Run a test suite and collect results
 * @param {string} suiteName - Name of the test suite
 * @param {Array<Function>} testFunctions - Array of test functions to run
 * @return {Array<Object>} Test results
 */
function runTestSuite(suiteName, testFunctions) {
  const results = [];

  testFunctions.forEach(testFunc => {
    try {
      const testResults = testFunc();
      results.push(...testResults);

      // Log individual test results
      testResults.forEach(result => {
        const status = result.passed ? '✓' : '✗';
        const message = result.passed
          ? `${status} ${result.name}`
          : `${status} ${result.name} - ${result.error}`;
        Logger.log(message);
      });
    } catch (error) {
      // If the entire test function fails
      results.push({
        name: `${suiteName}.${testFunc.name}`,
        passed: false,
        error: error.message
      });
      Logger.log(`✗ ${suiteName}.${testFunc.name} - ${error.message}`);
    }
  });

  return results;
}

/**
 * Print test summary
 * @param {Array<Object>} results - All test results
 */
function printTestSummary(results) {
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  Logger.log(`\nTests: ${passed} passed, ${failed} failed, ${total} total`);

  if (failed > 0) {
    Logger.log('\nFailed tests:');
    results.filter(r => !r.passed).forEach(result => {
      Logger.log(`  - ${result.name}: ${result.error}`);
    });
  }

  const successRate = ((passed / total) * 100).toFixed(1);
  Logger.log(`Success rate: ${successRate}%`);
}

/**
 * Quick test function to verify TestRunner works
 * Run this first to ensure the testing infrastructure is functioning
 */
function quickTest() {
  Logger.log('Running quick test...');

  // Should pass
  try {
    assertEqual(1, 1);
    Logger.log('✓ assertEqual works');
  } catch (e) {
    Logger.log('✗ assertEqual failed: ' + e.message);
  }

  // Should pass
  try {
    assertContains('hello world', 'world');
    Logger.log('✓ assertContains works');
  } catch (e) {
    Logger.log('✗ assertContains failed: ' + e.message);
  }

  // Should fail (intentionally)
  try {
    assertEqual(1, 2);
    Logger.log('✗ assertEqual should have thrown');
  } catch (e) {
    Logger.log('✓ assertEqual correctly throws on mismatch');
  }

  Logger.log('\nQuick test complete! You can now run runAllTests()');
}
