/**
 * Gmail API Integration
 * Functions for fetching and parsing Gmail threads and messages
 */

/**
 * Build Gmail search query string
 * @param {Object} options - Search options
 *   - label: Gmail label to search
 *   - fromDomain: Filter by sender domain (e.g., 'customer.com')
 *   - fromEmail: Filter by specific sender email
 *   - afterDate: Date to search after
 *   - beforeDate: Date to search before
 * @return {string} Gmail search query string
 */
function buildGmailSearchQuery(options) {
  options = options || {};
  const queryParts = [];

  // Add label filter
  if (options.label) {
    queryParts.push(`label:${options.label}`);
  }

  // Add domain filter (wildcard for all senders from domain)
  if (options.fromDomain) {
    queryParts.push(`from:*@${options.fromDomain}`);
  }

  // Add specific sender email filter
  if (options.fromEmail) {
    queryParts.push(`from:${options.fromEmail}`);
  }

  // Add date range filters
  if (options.afterDate) {
    const afterStr = formatDateForGmailSearch(options.afterDate);
    queryParts.push(`after:${afterStr}`);
  }

  if (options.beforeDate) {
    const beforeStr = formatDateForGmailSearch(options.beforeDate);
    queryParts.push(`before:${beforeStr}`);
  }

  // Combine all parts with spaces (AND logic)
  return queryParts.join(' ');
}

/**
 * Format date for Gmail search (yyyy/mm/dd)
 * @param {Date} date - Date to format
 * @return {string} Formatted date string
 */
function formatDateForGmailSearch(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/**
 * Format date for display in documents
 * @param {Date} date - Date to format
 * @return {string} Formatted date string
 */
function formatGmailDate(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${month} ${day}, ${year} ${hours}:${minutes}`;
}

/**
 * Parse Gmail threads into structured format
 * @param {Array<GmailThread>} threads - Array of GmailThread objects
 * @return {Array<Object>} Parsed thread objects
 */
function parseGmailThreads(threads) {
  if (!threads || threads.length === 0) {
    return [];
  }

  return threads.map(thread => {
    const messages = thread.getMessages();
    const parsedMessages = messages.map(message => {
      return {
        from: message.getFrom(),
        to: message.getTo(),
        date: message.getDate(),
        dateFormatted: formatGmailDate(message.getDate()),
        subject: message.getSubject(),
        body: message.getPlainBody()
      };
    });

    return {
      subject: thread.getFirstMessageSubject(),
      messageCount: thread.getMessageCount(),
      messages: parsedMessages,
      formattedThread: formatThreadForDocument(thread.getFirstMessageSubject(), parsedMessages)
    };
  });
}

/**
 * Format Gmail thread for document output
 * @param {string} subject - Thread subject
 * @param {Array<Object>} messages - Parsed messages
 * @return {string} Formatted thread text
 */
function formatThreadForDocument(subject, messages) {
  let formatted = `Thread: "${subject}" (${messages.length} message${messages.length !== 1 ? 's' : ''})\n`;
  formatted += `${messages[0].dateFormatted} - ${messages[messages.length - 1].dateFormatted}\n\n`;

  messages.forEach((message, index) => {
    formatted += `From: ${message.from}\n`;
    formatted += `To: ${message.to}\n`;
    formatted += `Subject: ${message.subject}\n`;
    formatted += `Date: ${message.dateFormatted}\n\n`;
    formatted += `${message.body}\n`;

    if (index < messages.length - 1) {
      formatted += '\n---\n\n';
    }
  });

  return formatted;
}

/**
 * Fetch Gmail threads based on search criteria
 * @param {Object} options - Search options (same as buildGmailSearchQuery)
 * @return {Array<Object>} Parsed thread objects
 * @throws {Error} If search fails
 */
function fetchGmailThreads(options) {
  try {
    const query = buildGmailSearchQuery(options);

    // Use GmailApp.search() - built-in Apps Script service
    const threads = GmailApp.search(query, 0, 50); // Max 50 threads

    return parseGmailThreads(threads);

  } catch (error) {
    throw new Error(`Gmail search failed: ${error.message}`);
  }
}

/**
 * Fetch Gmail threads for a specific date range
 * @param {Date} startDate - Start date (inclusive)
 * @param {Date} endDate - End date (inclusive)
 * @param {Object} additionalOptions - Additional search options (label, fromDomain, etc.)
 * @return {Array<Object>} Parsed thread objects
 */
function fetchGmailThreadsByDateRange(startDate, endDate, additionalOptions) {
  additionalOptions = additionalOptions || {};

  const options = Object.assign({}, additionalOptions, {
    afterDate: startDate,
    beforeDate: endDate
  });

  return fetchGmailThreads(options);
}
