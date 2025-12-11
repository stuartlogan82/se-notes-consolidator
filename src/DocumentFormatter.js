/**
 * DocumentFormatter.js
 * Formats transcripts and emails for insertion into Google Docs
 */

/**
 * Format document header with opportunity name and Salesforce link
 * @param {Object} config - Opportunity config with opportunityName and salesforceUrl
 * @return {string} Formatted header text
 */
function formatDocumentHeader(config) {
  const lines = [];

  lines.push(config.opportunityName + ' - Customer Consolidation');
  lines.push('');
  lines.push('Salesforce Opportunity: ' + config.salesforceUrl);
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');

  return lines.join('\n');
}

/**
 * Format a transcript section with metadata
 * @param {Object} transcript - Transcript object from Fireflies API
 * @return {string} Formatted transcript section
 */
function formatTranscriptSection(transcript) {
  const lines = [];

  // Title and date
  lines.push(transcript.title + ' - ' + transcript.date);

  // Participants
  if (transcript.participants && transcript.participants.length > 0) {
    lines.push('Participants: ' + formatParticipants(transcript.participants));
  }

  // Duration
  lines.push('Duration: ' + transcript.durationMinutes + ' min');
  lines.push('');

  // Transcript content
  lines.push(transcript.formattedTranscript);

  return lines.join('\n');
}

/**
 * Format an email thread section
 * @param {Object} thread - Email thread object from Gmail API
 * @return {string} Formatted email thread section
 */
function formatEmailThreadSection(thread) {
  const lines = [];

  // Thread subject and message count
  lines.push('Thread: "' + thread.subject + '" (' + thread.messageCount + ' messages)');
  lines.push('');

  // Each message in the thread
  thread.messages.forEach(function(message) {
    lines.push('From: ' + message.from);
    lines.push('Date: ' + message.dateFormatted);
    lines.push('Subject: ' + message.subject);
    lines.push('');
    lines.push(message.body);
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Format a section header with appropriate emoji
 * @param {string} sectionName - Section name (e.g., "CALL TRANSCRIPTS")
 * @return {string} Formatted section header
 */
function formatSectionHeader(sectionName) {
  const emojiMap = {
    'CALL TRANSCRIPTS': '📞',
    'EMAIL CORRESPONDENCE': '📧',
    'TECHNICAL REQUIREMENTS': '🔧',
    'TIMELINE & COMMITMENTS': '📅'
  };

  const emoji = emojiMap[sectionName] || '📋';

  return emoji + ' ' + sectionName;
}

/**
 * Format metadata with label and value
 * @param {Object} options - Options with label and value
 * @return {string} Formatted metadata line
 */
function formatMetadata(options) {
  const label = options.label;
  let value = options.value;

  // Handle different value types
  if (Array.isArray(value)) {
    value = formatParticipants(value);
  } else if (typeof value === 'number' && label === 'Duration') {
    value = value + ' min';
  }

  return label + ': ' + value;
}

/**
 * Format content separator
 * @return {string} Separator line
 */
function formatContentSeparator() {
  return '\n---\n';
}

/**
 * Format participant list
 * @param {Array<string>} participants - Array of participant emails
 * @return {string} Comma-separated participant list
 */
function formatParticipants(participants) {
  if (!participants || participants.length === 0) {
    return '';
  }

  return participants.join(', ');
}

/**
 * Format date string for display
 * @param {string} dateString - Date string from API
 * @return {string} Formatted date
 */
function formatDateForDisplay(dateString) {
  // For now, return as-is
  // Could be enhanced to format in specific timezone or format
  return dateString;
}

/**
 * Format duration in minutes
 * @param {number} minutes - Duration in minutes
 * @return {string} Formatted duration
 */
function formatDuration(minutes) {
  if (minutes < 60) {
    return minutes + ' min';
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return hours + ' hr';
  }

  return hours + ' hr ' + remainingMinutes + ' min';
}
