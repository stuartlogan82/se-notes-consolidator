/**
 * Tests for DocumentFormatter.js
 * Following TDD: Write tests first, then implement
 */

function testFormatDocumentHeader() {
  const tests = [];

  // Test 1: Format header with opportunity name and Salesforce link
  try {
    const config = {
      opportunityName: 'Acme Corp Q4 Deal',
      salesforceUrl: 'https://8x8.lightning.force.com/lightning/r/Opportunity/123/view'
    };

    const header = formatDocumentHeader(config);

    assertContains(header, 'Acme Corp Q4 Deal');
    assertContains(header, 'Customer Consolidation');
    assertContains(header, 'Salesforce Opportunity');
    assertContains(header, config.salesforceUrl);

    tests.push({ name: 'formatDocumentHeader includes opportunity name and link', passed: true });
  } catch (e) {
    tests.push({ name: 'formatDocumentHeader includes opportunity name and link', passed: false, error: e.message });
  }

  // Test 2: Include visual separator
  try {
    const config = {
      opportunityName: 'Test Opp',
      salesforceUrl: 'https://example.com'
    };

    const header = formatDocumentHeader(config);

    // Should include a visual separator line
    assertContains(header, '━');

    tests.push({ name: 'formatDocumentHeader includes visual separator', passed: true });
  } catch (e) {
    tests.push({ name: 'formatDocumentHeader includes visual separator', passed: false, error: e.message });
  }

  return tests;
}

function testFormatTranscriptSection() {
  const tests = [];

  // Mock transcript object (from Fireflies API)
  const mockTranscript = {
    id: 'trans-123',
    title: 'Customer Discovery Call',
    date: '2025-01-15',
    durationMinutes: 45,
    participants: ['john@acme.com', 'sarah@8x8.com'],
    sentences: [
      { speaker_name: 'John', text: 'We need better integration.', start_time: 0 },
      { speaker_name: 'Sarah', text: 'I can help with that.', start_time: 5 }
    ],
    formattedTranscript: 'John: We need better integration.\nSarah: I can help with that.'
  };

  // Test 1: Format transcript with metadata
  try {
    const formatted = formatTranscriptSection(mockTranscript);

    assertContains(formatted, 'Customer Discovery Call');
    assertContains(formatted, '2025-01-15');
    assertContains(formatted, '45 min');
    assertContains(formatted, 'john@acme.com');
    assertContains(formatted, 'sarah@8x8.com');

    tests.push({ name: 'formatTranscriptSection includes title, date, duration, participants', passed: true });
  } catch (e) {
    tests.push({ name: 'formatTranscriptSection includes title, date, duration, participants', passed: false, error: e.message });
  }

  // Test 2: Include formatted transcript content
  try {
    const formatted = formatTranscriptSection(mockTranscript);

    assertContains(formatted, 'John: We need better integration');
    assertContains(formatted, 'Sarah: I can help with that');

    tests.push({ name: 'formatTranscriptSection includes transcript content', passed: true });
  } catch (e) {
    tests.push({ name: 'formatTranscriptSection includes transcript content', passed: false, error: e.message });
  }

  // Test 3: Handle empty participants list
  try {
    const emptyParticipants = Object.assign({}, mockTranscript, { participants: [] });
    const formatted = formatTranscriptSection(emptyParticipants);

    // Should still format without error
    assertContains(formatted, 'Customer Discovery Call');

    tests.push({ name: 'formatTranscriptSection handles empty participants', passed: true });
  } catch (e) {
    tests.push({ name: 'formatTranscriptSection handles empty participants', passed: false, error: e.message });
  }

  return tests;
}

function testFormatEmailThreadSection() {
  const tests = [];

  // Mock email thread object (from Gmail API)
  const mockThread = {
    subject: 'Technical Integration Questions',
    messageCount: 2,
    messages: [
      {
        from: 'John Doe <john@acme.com>',
        to: 'support@8x8.com',
        dateFormatted: 'Jan 15, 2025, 10:30 AM',
        subject: 'Technical Integration Questions',
        body: 'We need help with the API integration.'
      },
      {
        from: 'Sarah Smith <sarah@8x8.com>',
        to: 'john@acme.com',
        dateFormatted: 'Jan 15, 2025, 2:00 PM',
        subject: 'Re: Technical Integration Questions',
        body: 'I can help you with that integration.'
      }
    ],
    formattedThread: 'Thread formatted content...'
  };

  // Test 1: Format email thread with subject and message count
  try {
    const formatted = formatEmailThreadSection(mockThread);

    assertContains(formatted, 'Technical Integration Questions');
    assertContains(formatted, '2 messages');

    tests.push({ name: 'formatEmailThreadSection includes subject and message count', passed: true });
  } catch (e) {
    tests.push({ name: 'formatEmailThreadSection includes subject and message count', passed: false, error: e.message });
  }

  // Test 2: Include message details
  try {
    const formatted = formatEmailThreadSection(mockThread);

    assertContains(formatted, 'john@acme.com');
    assertContains(formatted, 'Jan 15, 2025, 10:30 AM');
    assertContains(formatted, 'We need help with the API integration');

    tests.push({ name: 'formatEmailThreadSection includes message details', passed: true });
  } catch (e) {
    tests.push({ name: 'formatEmailThreadSection includes message details', passed: false, error: e.message });
  }

  // Test 3: Include all messages in thread
  try {
    const formatted = formatEmailThreadSection(mockThread);

    assertContains(formatted, 'sarah@8x8.com');
    assertContains(formatted, 'I can help you with that integration');

    tests.push({ name: 'formatEmailThreadSection includes all messages', passed: true });
  } catch (e) {
    tests.push({ name: 'formatEmailThreadSection includes all messages', passed: false, error: e.message });
  }

  return tests;
}

function testFormatSectionHeader() {
  const tests = [];

  // Test 1: Format Call Transcripts header with emoji
  try {
    const header = formatSectionHeader('CALL TRANSCRIPTS');

    assertContains(header, '📞');
    assertContains(header, 'CALL TRANSCRIPTS');

    tests.push({ name: 'formatSectionHeader includes emoji for Call Transcripts', passed: true });
  } catch (e) {
    tests.push({ name: 'formatSectionHeader includes emoji for Call Transcripts', passed: false, error: e.message });
  }

  // Test 2: Format Email Correspondence header with emoji
  try {
    const header = formatSectionHeader('EMAIL CORRESPONDENCE');

    assertContains(header, '📧');
    assertContains(header, 'EMAIL CORRESPONDENCE');

    tests.push({ name: 'formatSectionHeader includes emoji for Email Correspondence', passed: true });
  } catch (e) {
    tests.push({ name: 'formatSectionHeader includes emoji for Email Correspondence', passed: false, error: e.message });
  }

  // Test 3: Format Technical Requirements header with emoji
  try {
    const header = formatSectionHeader('TECHNICAL REQUIREMENTS');

    assertContains(header, '🔧');
    assertContains(header, 'TECHNICAL REQUIREMENTS');

    tests.push({ name: 'formatSectionHeader includes emoji for Technical Requirements', passed: true });
  } catch (e) {
    tests.push({ name: 'formatSectionHeader includes emoji for Technical Requirements', passed: false, error: e.message });
  }

  // Test 4: Format Timeline header with emoji
  try {
    const header = formatSectionHeader('TIMELINE & COMMITMENTS');

    assertContains(header, '📅');
    assertContains(header, 'TIMELINE & COMMITMENTS');

    tests.push({ name: 'formatSectionHeader includes emoji for Timeline', passed: true });
  } catch (e) {
    tests.push({ name: 'formatSectionHeader includes emoji for Timeline', passed: false, error: e.message });
  }

  return tests;
}

function testFormatMetadata() {
  const tests = [];

  // Test 1: Format participant list
  try {
    const metadata = formatMetadata({
      label: 'Participants',
      value: ['john@acme.com', 'sarah@8x8.com', 'bob@partner.com']
    });

    assertContains(metadata, 'Participants');
    assertContains(metadata, 'john@acme.com');
    assertContains(metadata, 'sarah@8x8.com');
    assertContains(metadata, 'bob@partner.com');

    tests.push({ name: 'formatMetadata formats participant list', passed: true });
  } catch (e) {
    tests.push({ name: 'formatMetadata formats participant list', passed: false, error: e.message });
  }

  // Test 2: Format duration
  try {
    const metadata = formatMetadata({
      label: 'Duration',
      value: 45
    });

    assertContains(metadata, 'Duration');
    assertContains(metadata, '45 min');

    tests.push({ name: 'formatMetadata formats duration', passed: true });
  } catch (e) {
    tests.push({ name: 'formatMetadata formats duration', passed: false, error: e.message });
  }

  // Test 3: Format simple string value
  try {
    const metadata = formatMetadata({
      label: 'Date',
      value: '2025-01-15'
    });

    assertContains(metadata, 'Date');
    assertContains(metadata, '2025-01-15');

    tests.push({ name: 'formatMetadata formats string value', passed: true });
  } catch (e) {
    tests.push({ name: 'formatMetadata formats string value', passed: false, error: e.message });
  }

  return tests;
}

function testFormatContentSeparator() {
  const tests = [];

  // Test 1: Format separator with dashes
  try {
    const separator = formatContentSeparator();

    assertContains(separator, '---');

    tests.push({ name: 'formatContentSeparator creates dash separator', passed: true });
  } catch (e) {
    tests.push({ name: 'formatContentSeparator creates dash separator', passed: false, error: e.message });
  }

  // Test 2: Separator has newlines for spacing
  try {
    const separator = formatContentSeparator();

    // Should have newlines before and/or after for spacing
    assertEqual(separator.includes('\n'), true);

    tests.push({ name: 'formatContentSeparator includes newlines', passed: true });
  } catch (e) {
    tests.push({ name: 'formatContentSeparator includes newlines', passed: false, error: e.message });
  }

  return tests;
}

function testFormatParticipants() {
  const tests = [];

  // Test 1: Format multiple participants
  try {
    const participants = ['john@acme.com', 'sarah@8x8.com', 'bob@partner.com'];
    const formatted = formatParticipants(participants);

    assertContains(formatted, 'john@acme.com');
    assertContains(formatted, 'sarah@8x8.com');
    assertContains(formatted, 'bob@partner.com');

    tests.push({ name: 'formatParticipants formats multiple participants', passed: true });
  } catch (e) {
    tests.push({ name: 'formatParticipants formats multiple participants', passed: false, error: e.message });
  }

  // Test 2: Join with commas
  try {
    const participants = ['alice@company.com', 'bob@company.com'];
    const formatted = formatParticipants(participants);

    assertContains(formatted, ', ');

    tests.push({ name: 'formatParticipants joins with commas', passed: true });
  } catch (e) {
    tests.push({ name: 'formatParticipants joins with commas', passed: false, error: e.message });
  }

  // Test 3: Handle empty array
  try {
    const formatted = formatParticipants([]);

    assertEqual(formatted, '');

    tests.push({ name: 'formatParticipants handles empty array', passed: true });
  } catch (e) {
    tests.push({ name: 'formatParticipants handles empty array', passed: false, error: e.message });
  }

  return tests;
}
