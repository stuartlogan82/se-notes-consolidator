/**
 * MenuSetup.js
 * Creates custom menu in Google Sheets for manual triggering
 */

/**
 * Special Apps Script function that runs when spreadsheet opens
 * Creates custom menu with consolidation options
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu('Customer Consolidation')
    .addItem('Run Consolidation', 'runConsolidationFromMenu')
    .addSeparator()
    .addSubMenu(ui.createMenu('Automation')
      .addItem('Set Up Daily Trigger', 'setupTriggerFromMenu')
      .addItem('Remove Daily Trigger', 'removeTriggerFromMenu')
      .addItem('View Active Triggers', 'viewTriggersFromMenu'))
    .addSeparator()
    .addItem('View Setup Guide', 'showSetupGuide')
    .addItem('View Last Run Summary', 'showLastRunSummary')
    .addToUi();
}

/**
 * Menu handler for "Run Consolidation"
 * Shows progress notification and runs processOpportunities
 */
function runConsolidationFromMenu() {
  const ui = SpreadsheetApp.getUi();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  try {
    // Get opportunity count for progress message
    const sheet = spreadsheet.getSheetByName('Opportunity Tracker');

    if (!sheet) {
      ui.alert('Error', 'Opportunity Tracker sheet not found. Please create it first.', ui.ButtonSet.OK);
      return;
    }

    const configs = parseOpportunityConfigs(sheet);

    if (configs.length === 0) {
      ui.alert('No Opportunities', 'No opportunities found in the tracker. Please add some first.', ui.ButtonSet.OK);
      return;
    }

    // Show progress notification
    spreadsheet.toast('Processing ' + configs.length + ' opportunities...', 'Customer Consolidation', -1);

    // Run the main orchestration function
    const result = processOpportunities();

    // Hide the "Working" spinner immediately
    SpreadsheetApp.getActiveSpreadsheet().toast('', '', 1);

    // Show completion notification
    const message = 'Processed ' + result.processed + ' opportunities\n' +
                   'Successful: ' + result.successful + '\n' +
                   'Failed: ' + result.failed;

    if (result.failed > 0) {
      ui.alert('Consolidation Complete (with errors)', message, ui.ButtonSet.OK);
    } else {
      spreadsheet.toast('All opportunities processed successfully!', 'Success', 5);
      ui.alert('Consolidation Complete', message, ui.ButtonSet.OK);
    }

  } catch (error) {
    Logger.log('Error in runConsolidationFromMenu: ' + error.message);

    // Clear the spinner on error too
    SpreadsheetApp.getActiveSpreadsheet().toast('', '', 1);

    ui.alert('Error', 'An error occurred: ' + error.message, ui.ButtonSet.OK);
  } finally {
    // Always clear the spinner, even if something unexpected happens
    try {
      SpreadsheetApp.getActiveSpreadsheet().toast('', '', 1);
    } catch (e) {
      // Ignore - just making sure spinner is gone
    }
  }
}

/**
 * Show setup guide dialog
 */
function showSetupGuide() {
  const ui = SpreadsheetApp.getUi();

  const guide = '=== SETUP GUIDE ===\n\n' +
    '1. CONFIGURE SCRIPT PROPERTIES:\n' +
    '   - Go to Project Settings (gear icon)\n' +
    '   - Add Script Properties:\n' +
    '     • FIREFLIES_API_KEY: Your Fireflies API key\n\n' +
    '2. CREATE OPPORTUNITY TRACKER:\n' +
    '   - Add opportunities to the "Opportunity Tracker" sheet\n' +
    '   - Required columns:\n' +
    '     • Opportunity Name\n' +
    '     • Salesforce URL\n' +
    '     • Customer Domain (e.g., acme.com)\n' +
    '     • Gmail Labels (comma-separated)\n' +
    '     • Doc ID (leave empty to create new)\n' +
    '     • Last Sync Date (auto-updated)\n' +
    '     • Status (auto-updated)\n' +
    '     • Error Log (auto-updated)\n\n' +
    '3. GET GOOGLE DOC IDs:\n' +
    '   - Open a Google Doc\n' +
    '   - Copy the ID from the URL:\n' +
    '     docs.google.com/document/d/[DOC_ID]/edit\n\n' +
    '4. RUN CONSOLIDATION:\n' +
    '   - Click "Customer Consolidation" > "Run Consolidation"\n' +
    '   - First run may take longer as it creates document structures\n' +
    '   - Subsequent runs only append new content\n\n' +
    '5. SCHEDULE AUTOMATIC RUNS:\n' +
    '   - Go to Triggers (clock icon)\n' +
    '   - Add trigger: processOpportunities\n' +
    '   - Select time-based trigger\n' +
    '   - Choose daily, 8-9am recommended\n\n' +
    'For more information, see the README.';

  ui.alert('Customer Consolidation Setup Guide', guide, ui.ButtonSet.OK);
}

/**
 * Show last run summary (stored in script properties)
 */
function showLastRunSummary() {
  const ui = SpreadsheetApp.getUi();
  const properties = PropertiesService.getScriptProperties();

  const lastRun = properties.getProperty('LAST_RUN_TIMESTAMP');
  const lastResult = properties.getProperty('LAST_RUN_RESULT');

  if (!lastRun) {
    ui.alert('Last Run Summary', 'No previous runs found.', ui.ButtonSet.OK);
    return;
  }

  const summary = 'Last Run: ' + lastRun + '\n\n' + lastResult;

  ui.alert('Last Run Summary', summary, ui.ButtonSet.OK);
}

/**
 * Save run summary to script properties
 * @param {Object} result - Result from processOpportunities
 */
function saveRunSummary(result) {
  const properties = PropertiesService.getScriptProperties();

  const timestamp = new Date().toString();
  const summary = 'Processed: ' + result.processed + '\n' +
                 'Successful: ' + result.successful + '\n' +
                 'Failed: ' + result.failed;

  properties.setProperty('LAST_RUN_TIMESTAMP', timestamp);
  properties.setProperty('LAST_RUN_RESULT', summary);
}
