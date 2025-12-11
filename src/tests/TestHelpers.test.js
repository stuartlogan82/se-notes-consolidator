/**
 * Tests for TestHelpers.js
 * These tests validate our assertion functions work correctly
 */

function testAssertEqual() {
  const tests = [];

  // Test 1: assertEqual should pass when values are equal
  try {
    assertEqual(5, 5);
    assertEqual('hello', 'hello');
    assertEqual(true, true);
    tests.push({ name: 'assertEqual passes for equal values', passed: true });
  } catch (e) {
    tests.push({ name: 'assertEqual passes for equal values', passed: false, error: e.message });
  }

  // Test 2: assertEqual should throw when values are not equal
  try {
    assertEqual(5, 6);
    tests.push({ name: 'assertEqual throws for unequal values', passed: false, error: 'Did not throw' });
  } catch (e) {
    if (e.message.includes('expected 6, got 5')) {
      tests.push({ name: 'assertEqual throws for unequal values', passed: true });
    } else {
      tests.push({ name: 'assertEqual throws for unequal values', passed: false, error: 'Wrong error message: ' + e.message });
    }
  }

  // Test 3: assertEqual should use custom message if provided
  try {
    assertEqual(1, 2, 'Custom error message');
    tests.push({ name: 'assertEqual uses custom message', passed: false, error: 'Did not throw' });
  } catch (e) {
    if (e.message.includes('Custom error message')) {
      tests.push({ name: 'assertEqual uses custom message', passed: true });
    } else {
      tests.push({ name: 'assertEqual uses custom message', passed: false, error: 'Wrong error message: ' + e.message });
    }
  }

  return tests;
}

function testAssertContains() {
  const tests = [];

  // Test 1: assertContains should pass when substring exists
  try {
    assertContains('hello world', 'world');
    assertContains('testing 123', '123');
    tests.push({ name: 'assertContains passes when substring exists', passed: true });
  } catch (e) {
    tests.push({ name: 'assertContains passes when substring exists', passed: false, error: e.message });
  }

  // Test 2: assertContains should throw when substring doesn't exist
  try {
    assertContains('hello world', 'xyz');
    tests.push({ name: 'assertContains throws when substring missing', passed: false, error: 'Did not throw' });
  } catch (e) {
    if (e.message.includes('to contain')) {
      tests.push({ name: 'assertContains throws when substring missing', passed: true });
    } else {
      tests.push({ name: 'assertContains throws when substring missing', passed: false, error: 'Wrong error: ' + e.message });
    }
  }

  return tests;
}

function testFail() {
  const tests = [];

  // Test 1: fail should always throw an error
  try {
    fail('This should fail');
    tests.push({ name: 'fail throws error', passed: false, error: 'Did not throw' });
  } catch (e) {
    if (e.message === 'This should fail') {
      tests.push({ name: 'fail throws error', passed: true });
    } else {
      tests.push({ name: 'fail throws error', passed: false, error: 'Wrong message: ' + e.message });
    }
  }

  return tests;
}
