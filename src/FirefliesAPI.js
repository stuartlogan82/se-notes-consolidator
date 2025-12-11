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
 * @param {Object} options - Query options
 *   - limit: Max number of transcripts (default: 50)
 *   - channel_id: Filter by Fireflies channel ID
 * @return {string} GraphQL query string
 */
function buildFirefliesGraphQLQuery(options) {
  options = options || {};

  // Build query arguments
  const args = [];

  if (options.limit) {
    args.push(`limit: ${options.limit}`);
  }

  if (options.channel_id) {
    args.push(`channel_id: "${options.channel_id}"`);
  }

  const argsString = args.length > 0 ? `(${args.join(', ')})` : '';

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
 *   - channel_id: Filter by Fireflies channel ID (recommended)
 *   - sinceDate: Filter transcripts after this date (applied in-memory)
 * @return {Array<Object>} Parsed transcript objects
 * @throws {Error} If API call fails or response is invalid
 */
function fetchFirefliesTranscripts(options) {
  options = options || {};
  const apiKey = PropertiesService.getScriptProperties().getProperty('FIREFLIES_API_KEY');

  if (!apiKey) {
    throw new Error('FIREFLIES_API_KEY not configured in Script Properties');
  }

  // Build query with channel_id filter if provided
  const queryOptions = {
    limit: options.limit || 50
  };

  if (options.channel_id) {
    queryOptions.channel_id = options.channel_id;
  }

  const query = buildFirefliesGraphQLQuery(queryOptions);
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

    // Apply in-memory date filter if provided
    if (options.sinceDate) {
      const sinceDateMs = options.sinceDate instanceof Date
        ? options.sinceDate.getTime()
        : options.sinceDate;
      transcripts = transcripts.filter(t => {
        const transcriptDate = new Date(t.date).getTime();
        return transcriptDate >= sinceDateMs;
      });
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

/**
 * List all Fireflies channels for the authenticated user
 * This helper function retrieves channel IDs and names to help with configuration
 *
 * USAGE:
 * 1. Run this function from Apps Script IDE
 * 2. Check the execution log to see all your channels
 * 3. Copy the channel ID for the customer you want to track
 * 4. Paste it into the "Fireflies Channel ID" column in your Opportunity Tracker
 *
 * NOTE: Fireflies API doesn't have a direct channels query, so we extract
 * unique channels from your recent transcripts.
 *
 * @return {Array<Object>} Array of channel objects with id and name
 * @throws {Error} If API call fails
 */
function listFirefliesChannels() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('FIREFLIES_API_KEY');

  if (!apiKey) {
    throw new Error('FIREFLIES_API_KEY not configured in Script Properties');
  }

  // Query recent transcripts with their channels field
  // Note: Channel type may only have 'id' field, not 'name'
  const query = `
    query {
      transcripts(limit: 50) {
        id
        title
        channels {
          id
        }
      }
    }
  `;

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

    if (statusCode !== 200) {
      throw new Error(`Fireflies API error: HTTP ${statusCode} - ${responseText}`);
    }

    const jsonResponse = JSON.parse(responseText);

    if (jsonResponse.errors) {
      const errorMessages = jsonResponse.errors.map(err => err.message).join(', ');
      throw new Error(`Fireflies GraphQL errors: ${errorMessages}`);
    }

    const transcripts = jsonResponse.data.transcripts || [];

    // Extract unique channels from all transcripts
    // Build a map: channel ID -> transcript titles that use this channel
    const channelMap = {};
    transcripts.forEach(transcript => {
      if (transcript.channels && transcript.channels.length > 0) {
        transcript.channels.forEach(channel => {
          if (!channelMap[channel.id]) {
            channelMap[channel.id] = {
              id: channel.id,
              transcriptTitles: []
            };
          }
          // Add transcript title to help identify the channel
          if (transcript.title && channelMap[channel.id].transcriptTitles.length < 3) {
            channelMap[channel.id].transcriptTitles.push(transcript.title);
          }
        });
      }
    });

    const channels = Object.values(channelMap);

    // Log channels to execution log for easy viewing
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('FIREFLIES CHANNELS (from recent transcripts)');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (channels.length === 0) {
      Logger.log('⚠ No channels found in recent transcripts.');
      Logger.log('Make sure your transcripts are organized into channels in Fireflies.');
    } else {
      channels.forEach(channel => {
        Logger.log(`Channel ID: ${channel.id}`);
        if (channel.transcriptTitles.length > 0) {
          Logger.log(`Sample transcripts in this channel:`);
          channel.transcriptTitles.forEach(title => {
            Logger.log(`  - ${title}`);
          });
        }
        Logger.log('─────────────────────────────────────────');
      });
      Logger.log(`\nTotal unique channels: ${channels.length}`);
      Logger.log('\nℹ️ Use the Channel ID in your Opportunity Tracker spreadsheet.');
      Logger.log('   (Fireflies API doesn\'t expose channel names, only IDs)');
    }

    return channels;

  } catch (error) {
    if (error.message.includes('Fireflies')) {
      throw error;
    }
    throw new Error(`Failed to list Fireflies channels: ${error.message}`);
  }
}
