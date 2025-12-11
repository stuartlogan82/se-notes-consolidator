/**
 * Integration Tests
 * Tests that call real external APIs
 * These consume API quotas and require valid credentials
 */

/**
 * Test fetching transcripts from Fireflies API
 * This makes a real API call - use sparingly to avoid rate limits
 */
function testFirefliesIntegration() {
  Logger.log('=== Testing Fireflies Integration ===');

  try {
    // Fetch transcripts from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    Logger.log(`Fetching transcripts since ${thirtyDaysAgo.toDateString()}...`);

    const options = {
      sinceDate: thirtyDaysAgo,
      limit: 50 // Fetch up to 50, filter in-memory
    };

    const transcripts = fetchFirefliesTranscripts(options);

    Logger.log(`✓ Successfully fetched ${transcripts.length} transcripts`);

    if (transcripts.length > 0) {
      Logger.log('\nFirst transcript details:');
      const first = transcripts[0];
      Logger.log(`  ID: ${first.id}`);
      Logger.log(`  Title: ${first.title}`);
      Logger.log(`  Date: ${first.date}`);
      Logger.log(`  Duration: ${first.durationMinutes} minutes`);
      Logger.log(`  Participants: ${first.participants.join(', ')}`);
      Logger.log(`  Sentences: ${first.sentences.length}`);

      if (first.formattedTranscript) {
        const preview = first.formattedTranscript.substring(0, 200);
        Logger.log(`  Transcript preview: ${preview}...`);
      }
    } else {
      Logger.log('⚠ No transcripts found in the last 30 days');
    }

    Logger.log('\n✓ Fireflies integration test passed');
    return true;

  } catch (error) {
    Logger.log(`✗ Fireflies integration test failed: ${error.message}`);
    Logger.log(`Error stack: ${error.stack}`);
    return false;
  }
}

/**
 * Test fetching transcripts with participant filter
 */
function testFirefliesWithParticipantFilter() {
  Logger.log('=== Testing Fireflies with Participant Filter ===');

  try {
    // Get participant email from user
    const participantEmail = 'stuart.logan@8x8.com'; // Change this to test

    Logger.log(`Fetching transcripts with participant: ${participantEmail}...`);

    const options = {
      participantEmail: participantEmail,
      limit: 5
    };

    const transcripts = fetchFirefliesTranscripts(options);

    Logger.log(`✓ Successfully fetched ${transcripts.length} transcripts with ${participantEmail}`);

    transcripts.forEach((transcript, index) => {
      Logger.log(`\n${index + 1}. ${transcript.title}`);
      Logger.log(`   Date: ${transcript.date}`);
      Logger.log(`   Participants: ${transcript.participants.join(', ')}`);
    });

    return true;

  } catch (error) {
    Logger.log(`✗ Participant filter test failed: ${error.message}`);
    return false;
  }
}

/**
 * Quick validation that API key is configured
 */
function validateFirefliesSetup() {
  Logger.log('=== Validating Fireflies Setup ===');

  const apiKey = PropertiesService.getScriptProperties().getProperty('FIREFLIES_API_KEY');

  if (!apiKey) {
    Logger.log('✗ FIREFLIES_API_KEY not configured');
    Logger.log('Run setupFirefliesAPIKey("your-api-key") first');
    return false;
  }

  Logger.log('✓ FIREFLIES_API_KEY is configured');
  Logger.log(`Key length: ${apiKey.length} characters`);

  return true;
}

/**
 * Test fetching threads from Gmail
 * This makes a real Gmail API call
 */
function testGmailIntegration() {
  Logger.log('=== Testing Gmail Integration ===');

  try {
    // Fetch recent emails from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    Logger.log(`Fetching Gmail threads since ${sevenDaysAgo.toDateString()}...`);

    const options = {
      afterDate: sevenDaysAgo
    };

    const threads = fetchGmailThreads(options);

    Logger.log(`✓ Successfully fetched ${threads.length} threads`);

    if (threads.length > 0) {
      Logger.log('\nFirst thread details:');
      const first = threads[0];
      Logger.log(`  Subject: ${first.subject}`);
      Logger.log(`  Message Count: ${first.messageCount}`);
      Logger.log(`  First Message From: ${first.messages[0].from}`);
      Logger.log(`  First Message Date: ${first.messages[0].dateFormatted}`);

      if (first.formattedThread) {
        const preview = first.formattedThread.substring(0, 200);
        Logger.log(`  Thread preview: ${preview}...`);
      }
    } else {
      Logger.log('⚠ No threads found in the last 7 days');
    }

    Logger.log('\n✓ Gmail integration test passed');
    return true;

  } catch (error) {
    Logger.log(`✗ Gmail integration test failed: ${error.message}`);
    Logger.log(`Error stack: ${error.stack}`);
    return false;
  }
}

/**
 * Test Gmail with label filter
 */
function testGmailWithLabel() {
  Logger.log('=== Testing Gmail with Label Filter ===');

  try {
    // Change this to a label you actually use
    const labelName = 'INBOX'; // Use INBOX for testing

    Logger.log(`Fetching threads with label: ${labelName}...`);

    const options = {
      label: labelName
    };

    const threads = fetchGmailThreads(options);

    Logger.log(`✓ Successfully fetched ${threads.length} threads with label ${labelName}`);

    threads.slice(0, 5).forEach((thread, index) => {
      Logger.log(`\n${index + 1}. ${thread.subject}`);
      Logger.log(`   Messages: ${thread.messageCount}`);
      Logger.log(`   From: ${thread.messages[0].from}`);
    });

    return true;

  } catch (error) {
    Logger.log(`✗ Label filter test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test Gmail with domain filter
 */
function testGmailWithDomain() {
  Logger.log('=== Testing Gmail with Domain Filter ===');

  try {
    // Change this to a domain you receive emails from
    const domain = '8x8.com'; // Change to test with your domain

    Logger.log(`Fetching threads from domain: ${domain}...`);

    const options = {
      fromDomain: domain
    };

    const threads = fetchGmailThreads(options);

    Logger.log(`✓ Successfully fetched ${threads.length} threads from @${domain}`);

    threads.slice(0, 3).forEach((thread, index) => {
      Logger.log(`\n${index + 1}. ${thread.subject}`);
      Logger.log(`   From: ${thread.messages[0].from}`);
    });

    return true;

  } catch (error) {
    Logger.log(`✗ Domain filter test failed: ${error.message}`);
    return false;
  }
}
