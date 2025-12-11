/**
 * Fireflies API Integration
 * Functions for fetching and parsing Fireflies meeting transcripts
 */

/**
 * Setup function to configure Fireflies API key
 * INSTRUCTIONS:
 * 1. Replace 'YOUR_API_KEY_HERE' below with your actual Fireflies API key
 * 2. Run this function once
 * 3. Delete or comment out your API key after running for security
 */
function setupFirefliesAPIKey() {
  // EDIT THIS LINE - Replace with your actual API key:
  const apiKey = 'YOUR_API_KEY_HERE';

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    throw new Error('Please edit this function and add your Fireflies API key');
  }

  PropertiesService.getScriptProperties().setProperty('FIREFLIES_API_KEY', apiKey);
  Logger.log('✓ Fireflies API key configured successfully');
  Logger.log('You can now use fetchFirefliesTranscripts() to retrieve transcripts');
  Logger.log('⚠ For security, consider removing your API key from this function now');
}

/**
 * Parse Fireflies GraphQL API response
 * @param {Object} response - Raw GraphQL response from Fireflies API
 * @return {Array<Object>} Parsed transcript objects
 * @throws {Error} If response is malformed
 */
function parseFirefliesResponse(response) {
  // Validate response structure
  if (!response || !response.data || !response.data.transcripts) {
    throw new Error('Invalid Fireflies response: missing data or transcripts');
  }

  const transcripts = response.data.transcripts;

  // Parse each transcript
  return transcripts.map(transcript => {
    return {
      id: transcript.id,
      title: transcript.title,
      date: transcript.dateString,
      durationMinutes: Math.round(transcript.duration / 60),
      participants: transcript.participants || [],
      sentences: transcript.sentences || [],
      formattedTranscript: formatTranscriptSentences(transcript.sentences || [])
    };
  });
}

/**
 * Format transcript sentences into readable text with speaker labels
 * @param {Array<Object>} sentences - Array of sentence objects with speaker_name and text
 * @return {string} Formatted transcript text
 */
function formatTranscriptSentences(sentences) {
  if (!sentences || sentences.length === 0) {
    return '';
  }

  return sentences
    .map(sentence => `${sentence.speaker_name}: ${sentence.text}`)
    .join('\n');
}

/**
 * Build GraphQL query for fetching transcripts
 * NOTE: Fireflies API filtering via GraphQL may have limitations.
 * For now, we fetch all recent transcripts and filter in-memory.
 * @param {Object} options - Query options (limit only for now)
 * @return {string} GraphQL query string
 */
function buildFirefliesGraphQLQuery(options) {
  options = options || {};

  // For now, only support limit to avoid filter issues
  // We'll filter by date/participant in-memory after fetching
  const argsString = options.limit ? `(limit: ${options.limit})` : '';

  // Build query with all required fields
  const query = `
    query {
      transcripts${argsString} {
        id
        title
        dateString
        date
        duration
        participants
        sentences {
          speaker_name
          text
          start_time
        }
        audio_url
        transcript_url
      }
    }
  `;

  return query;
}

/**
 * Fetch transcripts from Fireflies API
 * @param {Object} options - Query options
 *   - limit: Max number of transcripts to fetch (default: 50)
 *   - sinceDate: Filter transcripts after this date (applied in-memory)
 *   - participantEmail: Filter by participant email (applied in-memory)
 * @return {Array<Object>} Parsed transcript objects
 * @throws {Error} If API call fails or response is invalid
 */
function fetchFirefliesTranscripts(options) {
  options = options || {};
  const apiKey = PropertiesService.getScriptProperties().getProperty('FIREFLIES_API_KEY');

  if (!apiKey) {
    throw new Error('FIREFLIES_API_KEY not configured in Script Properties');
  }

  // Fetch transcripts (filters will be applied in-memory)
  const limit = options.limit || 50;
  const query = buildFirefliesGraphQLQuery({ limit: limit });
  const endpoint = 'https://api.fireflies.ai/graphql';

  const requestOptions = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    payload: JSON.stringify({ query: query }),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(endpoint, requestOptions);
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();

    // Handle HTTP errors
    if (statusCode !== 200) {
      throw new Error(`Fireflies API error: HTTP ${statusCode} - ${responseText}`);
    }

    // Parse JSON response
    const jsonResponse = JSON.parse(responseText);

    // Check for GraphQL errors
    if (jsonResponse.errors) {
      const errorMessages = jsonResponse.errors.map(err => err.message).join(', ');
      throw new Error(`Fireflies GraphQL errors: ${errorMessages}`);
    }

    // Parse transcripts
    let transcripts = parseFirefliesResponse(jsonResponse);

    // Apply in-memory filters
    if (options.sinceDate) {
      const sinceDateMs = options.sinceDate instanceof Date
        ? options.sinceDate.getTime()
        : options.sinceDate;
      transcripts = transcripts.filter(t => {
        const transcriptDate = new Date(t.date).getTime();
        return transcriptDate >= sinceDateMs;
      });
    }

    if (options.participantEmail) {
      transcripts = transcripts.filter(t =>
        t.participants.some(p => p.toLowerCase().includes(options.participantEmail.toLowerCase()))
      );
    }

    return transcripts;

  } catch (error) {
    // Re-throw with more context if it's our error
    if (error.message.includes('Fireflies')) {
      throw error;
    }

    // Wrap unexpected errors
    throw new Error(`Fireflies API request failed: ${error.message}`);
  }
}

/**
 * Fetch transcripts for a specific date range
 * @param {Date} startDate - Start date (inclusive)
 * @param {Date} endDate - End date (optional, defaults to now)
 * @return {Array<Object>} Parsed transcript objects
 */
function fetchFirefliesTranscriptsByDateRange(startDate, endDate) {
  endDate = endDate || new Date();

  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  // Fireflies API filters by a single date, so we need to fetch and filter
  // For now, fetch transcripts from start date and filter in memory
  const transcripts = fetchFirefliesTranscripts({ date: startTime, limit: 50 });

  // Filter to only include transcripts in date range
  return transcripts.filter(transcript => {
    const transcriptDate = new Date(transcript.date).getTime();
    return transcriptDate >= startTime && transcriptDate <= endTime;
  });
}
