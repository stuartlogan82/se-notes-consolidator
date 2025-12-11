/**
 * Orchestrator.js
 * Main workflow coordination for processing opportunities
 * Coordinates API calls, formatting, and document updates
 */

/**
 * Main entry point - process all opportunities
 * This is the function that will be called from the custom menu or time trigger
 */
function processOpportunities() {
  return processOpportunitiesHelper(
    SpreadsheetApp,
    {
      fetchFirefliesTranscripts: fetchFirefliesTranscripts
    },
    {
      fetchGmailThreads: fetchGmailThreads
    },
    {
      getOrCreateDocument: getOrCreateDocument,
      createDocumentStructure: createDocumentStructure,
      appendTranscript: appendTranscript,
      appendEmailThread: appendEmailThread
    },
    {
      updateLastSyncDate: updateLastSyncDate,
      updateOpportunityStatus: updateOpportunityStatus,
      updateDocId: updateDocId
    }
  );
}

/**
 * Helper function for processing opportunities (testable)
 * @param {Object} spreadsheetApp - SpreadsheetApp or mock
 * @param {Object} firefliesAPI - Fireflies API functions
 * @param {Object} gmailAPI - Gmail API functions
 * @param {Object} docsAPI - Docs API functions
 * @param {Object} sheetConfig - SheetConfig functions
 * @return {Object} Result summary { processed, successful, failed, errors }
 */
function processOpportunitiesHelper(spreadsheetApp, firefliesAPI, gmailAPI, docsAPI, sheetConfig) {
  const result = {
    processed: 0,
    successful: 0,
    failed: 0,
    errors: []
  };

  try {
    // Get active spreadsheet and opportunity tracker sheet
    const spreadsheet = spreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Opportunity Tracker');

    if (!sheet) {
      throw new Error('Opportunity Tracker sheet not found');
    }

    // Read opportunity configurations
    const configs = parseOpportunityConfigs(sheet);

    if (configs.length === 0) {
      Logger.log('No opportunities to process');
      return result;
    }

    Logger.log('Processing ' + configs.length + ' opportunities...');

    // Process each opportunity with error isolation
    configs.forEach(function(config) {
      result.processed++;

      try {
        processOpportunity(config, sheet, firefliesAPI, gmailAPI, docsAPI, sheetConfig);
        result.successful++;
        Logger.log('✓ Successfully processed: ' + config.opportunityName);

        // Clear any previous error log on successful processing
        clearErrorLog(sheet, config);
      } catch (error) {
        result.failed++;
        result.errors.push({
          opportunity: config.opportunityName,
          error: error.message
        });

        Logger.log('✗ Error processing ' + config.opportunityName + ': ' + error.message);

        // Log error to spreadsheet
        logError(sheet, config, error.message);

        // Update opportunity status to Error
        sheetConfig.updateOpportunityStatus(sheet, config, 'Error');
      }
    });

    Logger.log('Processing complete: ' + result.successful + ' successful, ' + result.failed + ' failed');

    // Save run summary for "View Last Run Summary" menu item
    try {
      saveRunSummary(result);
    } catch (e) {
      Logger.log('Could not save run summary: ' + e.message);
    }

  } catch (error) {
    Logger.log('Fatal error in processOpportunities: ' + error.message);
    throw error;
  }

  return result;
}

/**
 * Process a single opportunity
 * @param {Object} config - Opportunity configuration
 * @param {Sheet} sheet - Opportunity Tracker sheet
 * @param {Object} firefliesAPI - Fireflies API functions
 * @param {Object} gmailAPI - Gmail API functions
 * @param {Object} docsAPI - Docs API functions
 * @param {Object} sheetConfig - SheetConfig functions
 */
function processOpportunity(config, sheet, firefliesAPI, gmailAPI, docsAPI, sheetConfig) {
  Logger.log('Processing opportunity: ' + config.opportunityName);

  // Update status to Processing
  sheetConfig.updateOpportunityStatus(sheet, config, 'Processing');

  // Get or create document
  const doc = docsAPI.getOrCreateDocument(config.docId, config.opportunityName + ' - Customer Consolidation');
  const newDocId = doc.getId();

  // If doc was just created (no docId in config), save the new doc ID
  if (!config.docId || config.docId.trim() === '') {
    Logger.log('New doc created with ID: ' + newDocId + ', updating spreadsheet...');
    sheetConfig.updateDocId(sheet, config, newDocId);
    // Update the config object so subsequent operations have the ID
    config.docId = newDocId;
  }

  // Check if document has structure - if not, create it
  const body = doc.getBody();
  const sectionIndex = findSectionIndex(body, 'CALL TRANSCRIPTS');

  if (sectionIndex === -1) {
    Logger.log('Creating document structure for new doc: ' + config.opportunityName);
    docsAPI.createDocumentStructure(doc, {
      opportunityName: config.opportunityName,
      salesforceUrl: config.salesforceUrl
    });
  }

  // Determine since date (last sync or 30 days ago if empty)
  let sinceDate = config.lastSyncDate;
  if (!sinceDate || sinceDate === '') {
    // Default to 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    sinceDate = formatSyncDate(thirtyDaysAgo);
  }

  // Fetch new transcripts since last sync (using Fireflies channel)
  Logger.log('Fetching transcripts for channel ' + config.firefliesChannelId + ' since ' + sinceDate);
  const transcripts = firefliesAPI.fetchFirefliesTranscripts({
    channel_id: config.firefliesChannelId,
    sinceDate: new Date(sinceDate)
  });

  Logger.log('Found ' + transcripts.length + ' new transcripts');

  // Fetch new emails since last sync (using Gmail labels only)
  Logger.log('Fetching emails with labels: ' + config.gmailLabels + ' since ' + sinceDate);
  const emailThreads = gmailAPI.fetchGmailThreads({
    afterDate: new Date(sinceDate),
    label: config.gmailLabels
  });

  Logger.log('Found ' + emailThreads.length + ' new email threads');

  // Append transcripts to document
  if (transcripts.length > 0) {
    Logger.log('Appending ' + transcripts.length + ' transcripts to doc...');
    transcripts.forEach(function(transcript) {
      Logger.log('  - ' + transcript.title);
      docsAPI.appendTranscript(doc, transcript);
    });
  } else {
    Logger.log('No transcripts to append');
  }

  // Append email threads to document
  if (emailThreads.length > 0) {
    Logger.log('Appending ' + emailThreads.length + ' email threads to doc...');
    emailThreads.forEach(function(thread) {
      Logger.log('  - ' + thread.subject);
      docsAPI.appendEmailThread(doc, thread);
    });
  } else {
    Logger.log('No email threads to append');
  }

  // Update last sync date to now
  const now = new Date();
  sheetConfig.updateLastSyncDate(sheet, config, now);

  // Update status to Success
  sheetConfig.updateOpportunityStatus(sheet, config, 'Success');

  Logger.log('Successfully processed ' + config.opportunityName);
}

/**
 * Check if content already exists in document (deduplication)
 * @param {Body} body - Document body
 * @param {string} contentId - Unique ID to check (transcript ID or email message ID)
 * @return {boolean} True if content exists
 */
function contentExists(body, contentId) {
  const text = body.getText();
  return text.includes(contentId);
}
