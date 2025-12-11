/**
 * Tests for FirefliesAPI.js
 * Following TDD: Write tests first, then implement
 */

function testParseFirefliesResponse() {
  const tests = [];

  // Test 1: Parse valid response with single transcript
  try {
    const mockResponse = {
      data: {
        transcripts: [
          {
            id: 'trans-123',
            title: 'Customer Discovery Call',
            dateString: '2025-01-15',
            duration: 2700, // 45 minutes in seconds
            participants: ['john@customer.com', 'sarah@8x8.com'],
            sentences: [
              { speaker_name: 'John', text: 'We need better integration.', start_time: 0 },
              { speaker_name: 'Sarah', text: 'I can help with that.', start_time: 5 }
            ]
          }
        ]
      }
    };

    const result = parseFirefliesResponse(mockResponse);

    assertEqual(result.length, 1);
    assertEqual(result[0].id, 'trans-123');
    assertEqual(result[0].title, 'Customer Discovery Call');
    assertEqual(result[0].date, '2025-01-15');
    assertEqual(result[0].durationMinutes, 45);
    assertEqual(result[0].participants.length, 2);
    assertContains(result[0].participants[0], 'john@customer.com');
    assertEqual(result[0].sentences.length, 2);

    tests.push({ name: 'parseFirefliesResponse handles valid single transcript', passed: true });
  } catch (e) {
    tests.push({ name: 'parseFirefliesResponse handles valid single transcript', passed: false, error: e.message });
  }

  // Test 2: Parse response with multiple transcripts
  try {
    const mockResponse = {
      data: {
        transcripts: [
          {
            id: 'trans-1',
            title: 'Meeting 1',
            dateString: '2025-01-10',
            duration: 1800,
            participants: ['alice@customer.com'],
            sentences: []
          },
          {
            id: 'trans-2',
            title: 'Meeting 2',
            dateString: '2025-01-11',
            duration: 3600,
            participants: ['bob@customer.com'],
            sentences: []
          }
        ]
      }
    };

    const result = parseFirefliesResponse(mockResponse);

    assertEqual(result.length, 2);
    assertEqual(result[0].id, 'trans-1');
    assertEqual(result[1].id, 'trans-2');
    assertEqual(result[1].durationMinutes, 60);

    tests.push({ name: 'parseFirefliesResponse handles multiple transcripts', passed: true });
  } catch (e) {
    tests.push({ name: 'parseFirefliesResponse handles multiple transcripts', passed: false, error: e.message });
  }

  // Test 3: Handle empty transcripts array
  try {
    const mockResponse = {
      data: {
        transcripts: []
      }
    };

    const result = parseFirefliesResponse(mockResponse);

    assertEqual(result.length, 0);

    tests.push({ name: 'parseFirefliesResponse handles empty transcripts', passed: true });
  } catch (e) {
    tests.push({ name: 'parseFirefliesResponse handles empty transcripts', passed: false, error: e.message });
  }

  // Test 4: Handle malformed response (missing data)
  try {
    const mockResponse = { error: 'Invalid API key' };

    parseFirefliesResponse(mockResponse);

    tests.push({ name: 'parseFirefliesResponse throws on malformed response', passed: false, error: 'Did not throw' });
  } catch (e) {
    if (e.message.includes('Invalid Fireflies response')) {
      tests.push({ name: 'parseFirefliesResponse throws on malformed response', passed: true });
    } else {
      tests.push({ name: 'parseFirefliesResponse throws on malformed response', passed: false, error: 'Wrong error: ' + e.message });
    }
  }

  // Test 5: Format transcript text correctly
  try {
    const mockResponse = {
      data: {
        transcripts: [
          {
            id: 'trans-123',
            title: 'Test Meeting',
            dateString: '2025-01-15',
            duration: 600,
            participants: ['user@example.com'],
            sentences: [
              { speaker_name: 'Alice', text: 'Hello everyone.', start_time: 0 },
              { speaker_name: 'Bob', text: 'Hi Alice!', start_time: 3 },
              { speaker_name: 'Alice', text: 'Let\'s get started.', start_time: 6 }
            ]
          }
        ]
      }
    };

    const result = parseFirefliesResponse(mockResponse);
    const formattedText = result[0].formattedTranscript;

    assertContains(formattedText, 'Alice: Hello everyone.');
    assertContains(formattedText, 'Bob: Hi Alice!');
    assertContains(formattedText, 'Alice: Let\'s get started.');

    tests.push({ name: 'parseFirefliesResponse formats transcript text', passed: true });
  } catch (e) {
    tests.push({ name: 'parseFirefliesResponse formats transcript text', passed: false, error: e.message });
  }

  return tests;
}

function testBuildFirefliesGraphQLQuery() {
  const tests = [];

  // Test 1: Build query with date filter
  try {
    const date = new Date('2025-01-15').getTime();
    const query = buildFirefliesGraphQLQuery({ date: date });

    assertContains(query, 'query');
    assertContains(query, 'transcripts');
    assertContains(query, String(date));

    tests.push({ name: 'buildFirefliesGraphQLQuery includes date filter', passed: true });
  } catch (e) {
    tests.push({ name: 'buildFirefliesGraphQLQuery includes date filter', passed: false, error: e.message });
  }

  // Test 2: Build query with participant email filter
  try {
    const query = buildFirefliesGraphQLQuery({ participantEmail: 'john@customer.com' });

    assertContains(query, 'transcripts');
    assertContains(query, 'john@customer.com');

    tests.push({ name: 'buildFirefliesGraphQLQuery includes participant email', passed: true });
  } catch (e) {
    tests.push({ name: 'buildFirefliesGraphQLQuery includes participant email', passed: false, error: e.message });
  }

  // Test 3: Build query with limit
  try {
    const query = buildFirefliesGraphQLQuery({ limit: 25 });

    assertContains(query, 'limit');
    assertContains(query, '25');

    tests.push({ name: 'buildFirefliesGraphQLQuery includes limit', passed: true });
  } catch (e) {
    tests.push({ name: 'buildFirefliesGraphQLQuery includes limit', passed: false, error: e.message });
  }

  // Test 4: Build query with all required fields
  try {
    const query = buildFirefliesGraphQLQuery({});

    // Check for essential fields we need
    assertContains(query, 'id');
    assertContains(query, 'title');
    assertContains(query, 'dateString');
    assertContains(query, 'duration');
    assertContains(query, 'participants');
    assertContains(query, 'sentences');
    assertContains(query, 'speaker_name');
    assertContains(query, 'text');

    tests.push({ name: 'buildFirefliesGraphQLQuery includes all required fields', passed: true });
  } catch (e) {
    tests.push({ name: 'buildFirefliesGraphQLQuery includes all required fields', passed: false, error: e.message });
  }

  return tests;
}
