/**
 * Tests for GmailAPI.js
 * Following TDD: Write tests first, then implement
 */

function testBuildGmailSearchQuery() {
  const tests = [];

  // Test 1: Build query with label
  try {
    const query = buildGmailSearchQuery({ label: 'customer-support' });

    assertContains(query, 'label:customer-support');

    tests.push({ name: 'buildGmailSearchQuery includes label', passed: true });
  } catch (e) {
    tests.push({ name: 'buildGmailSearchQuery includes label', passed: false, error: e.message });
  }

  // Test 2: Build query with domain filter
  try {
    const query = buildGmailSearchQuery({ fromDomain: 'customer.com' });

    assertContains(query, 'from:*@customer.com');

    tests.push({ name: 'buildGmailSearchQuery includes domain filter', passed: true });
  } catch (e) {
    tests.push({ name: 'buildGmailSearchQuery includes domain filter', passed: false, error: e.message });
  }

  // Test 3: Build query with date range
  try {
    // Use specific date components to avoid timezone issues
    const afterDate = new Date(2025, 0, 15); // Jan 15, 2025
    const beforeDate = new Date(2025, 0, 20); // Jan 20, 2025
    const query = buildGmailSearchQuery({
      afterDate: afterDate,
      beforeDate: beforeDate
    });

    // Check that dates are present in correct format
    assertContains(query, 'after:');
    assertContains(query, 'before:');
    assertContains(query, '2025');

    tests.push({ name: 'buildGmailSearchQuery includes date range', passed: true });
  } catch (e) {
    tests.push({ name: 'buildGmailSearchQuery includes date range', passed: false, error: e.message });
  }

  // Test 4: Build query combining multiple filters
  try {
    const afterDate = new Date(2025, 0, 1); // Jan 1, 2025
    const query = buildGmailSearchQuery({
      label: 'important',
      fromDomain: 'acme.com',
      afterDate: afterDate
    });

    assertContains(query, 'label:important');
    assertContains(query, 'from:*@acme.com');
    assertContains(query, 'after:');
    assertContains(query, '2025');

    tests.push({ name: 'buildGmailSearchQuery combines multiple filters', passed: true });
  } catch (e) {
    tests.push({ name: 'buildGmailSearchQuery combines multiple filters', passed: false, error: e.message });
  }

  // Test 5: Build query with specific sender email
  try {
    const query = buildGmailSearchQuery({ fromEmail: 'john@customer.com' });

    assertContains(query, 'from:john@customer.com');

    tests.push({ name: 'buildGmailSearchQuery includes specific sender email', passed: true });
  } catch (e) {
    tests.push({ name: 'buildGmailSearchQuery includes specific sender email', passed: false, error: e.message });
  }

  return tests;
}

function testParseGmailThreads() {
  const tests = [];

  // Mock GmailThread objects
  const mockThreads = [
    {
      getFirstMessageSubject: function() { return 'Technical Integration Questions'; },
      getMessages: function() {
        return [
          {
            getFrom: function() { return 'John Doe <john@customer.com>'; },
            getTo: function() { return 'support@8x8.com'; },
            getDate: function() { return new Date('2025-01-15T10:30:00Z'); },
            getSubject: function() { return 'Technical Integration Questions'; },
            getPlainBody: function() { return 'We need help with the API integration.'; }
          },
          {
            getFrom: function() { return 'Sarah Smith <sarah@8x8.com>'; },
            getTo: function() { return 'john@customer.com'; },
            getDate: function() { return new Date('2025-01-15T14:00:00Z'); },
            getSubject: function() { return 'Re: Technical Integration Questions'; },
            getPlainBody: function() { return 'I can help you with that integration.'; }
          }
        ];
      },
      getMessageCount: function() { return 2; }
    }
  ];

  // Test 1: Parse single thread with multiple messages
  try {
    const parsed = parseGmailThreads(mockThreads);

    assertEqual(parsed.length, 1);
    assertEqual(parsed[0].subject, 'Technical Integration Questions');
    assertEqual(parsed[0].messageCount, 2);
    assertEqual(parsed[0].messages.length, 2);
    assertEqual(parsed[0].messages[0].from, 'John Doe <john@customer.com>');
    assertEqual(parsed[0].messages[1].from, 'Sarah Smith <sarah@8x8.com>');
    assertContains(parsed[0].messages[0].body, 'API integration');

    tests.push({ name: 'parseGmailThreads handles single thread', passed: true });
  } catch (e) {
    tests.push({ name: 'parseGmailThreads handles single thread', passed: false, error: e.message });
  }

  // Test 2: Format thread for document
  try {
    const parsed = parseGmailThreads(mockThreads);
    const formatted = parsed[0].formattedThread;

    assertContains(formatted, 'Technical Integration Questions');
    assertContains(formatted, 'john@customer.com');
    assertContains(formatted, 'sarah@8x8.com');
    assertContains(formatted, 'API integration');

    tests.push({ name: 'parseGmailThreads formats thread text', passed: true });
  } catch (e) {
    tests.push({ name: 'parseGmailThreads formats thread text', passed: false, error: e.message });
  }

  // Test 3: Handle empty threads array
  try {
    const parsed = parseGmailThreads([]);

    assertEqual(parsed.length, 0);

    tests.push({ name: 'parseGmailThreads handles empty array', passed: true });
  } catch (e) {
    tests.push({ name: 'parseGmailThreads handles empty array', passed: false, error: e.message });
  }

  return tests;
}

function testFormatGmailDate() {
  const tests = [];

  // Test 1: Format date consistently
  try {
    const date = new Date('2025-01-15T10:30:00Z');
    const formatted = formatGmailDate(date);

    // Should be in a readable format
    assertContains(formatted, '2025');
    assertContains(formatted, 'Jan' || 'January' || '01');

    tests.push({ name: 'formatGmailDate formats date consistently', passed: true });
  } catch (e) {
    tests.push({ name: 'formatGmailDate formats date consistently', passed: false, error: e.message });
  }

  return tests;
}
