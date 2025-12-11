/**
 * Test Helper Functions
 * Assertion utilities for Google Apps Script testing
 */

/**
 * Assert that two values are equal
 * @param {*} actual - The actual value
 * @param {*} expected - The expected value
 * @param {string} message - Optional custom error message
 * @throws {Error} If values are not equal
 */
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    const errorMsg = message || `Assertion failed: expected ${expected}, got ${actual}`;
    throw new Error(errorMsg);
  }
}

/**
 * Assert that a string contains a substring
 * @param {string} string - The string to search in
 * @param {string} substring - The substring to search for
 * @throws {Error} If substring is not found
 */
function assertContains(string, substring) {
  if (!string.includes(substring)) {
    throw new Error(`Expected "${string}" to contain "${substring}"`);
  }
}

/**
 * Explicitly fail a test with a message
 * @param {string} message - The failure message
 * @throws {Error} Always throws
 */
function fail(message) {
  throw new Error(message);
}

/**
 * Assert that a value is truthy
 * @param {*} value - The value to check
 * @param {string} message - Optional custom error message
 * @throws {Error} If value is falsy
 */
function assertTrue(value, message) {
  if (!value) {
    throw new Error(message || `Expected ${value} to be truthy`);
  }
}

/**
 * Assert that a value is falsy
 * @param {*} value - The value to check
 * @param {string} message - Optional custom error message
 * @throws {Error} If value is truthy
 */
function assertFalse(value, message) {
  if (value) {
    throw new Error(message || `Expected ${value} to be falsy`);
  }
}
