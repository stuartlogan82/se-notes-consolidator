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
