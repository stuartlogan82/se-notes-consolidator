/**
 * Customer Consolidation Automation
 * Main entry point for the Apps Script project
 */

function onOpen() {
  // Create custom menu when spreadsheet opens
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Customer Consolidation')
      .addItem('Run Sync', 'processOpportunities')
      .addToUi();
}

/**
 * Main orchestration function - processes all opportunities
 * This will be implemented in Milestone 2
 */
function processOpportunities() {
  Logger.log('Processing opportunities...');
  // TODO: Implement in Milestone 2
}
