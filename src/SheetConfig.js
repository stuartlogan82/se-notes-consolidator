/**
 * SheetConfig.js
 * Manages Google Sheet configuration for opportunity tracking
 */

/**
 * Parse opportunity configurations from a Google Sheet
 * @param {Sheet} sheet - Google Sheets Sheet object
 * @return {Array<Object>} Array of opportunity config objects
 */
function parseOpportunityConfigs(sheet) {
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    // No data rows (only header or empty)
    return [];
  }

  // Get all data rows (skip header row 1)
  const dataRange = sheet.getRange(2, 1, lastRow - 1, 8);
  const values = dataRange.getValues();

  return values.map((row, index) => {
    return {
      opportunityName: row[0] || '',
      salesforceUrl: row[1] || '',
      customerDomain: row[2] || '',
      gmailLabels: row[3] || '',
      docId: row[4] || '',
      lastSyncDate: row[5] || '',
      status: row[6] || '',
      errorLog: row[7] || '',
      rowNumber: index + 2  // +2 because: +1 for 0-index, +1 to skip header
    };
  });
}

/**
 * Get opportunity configurations from the active spreadsheet
 * @param {string} sheetName - Name of the sheet (default: "Opportunity Tracker")
 * @return {Array<Object>} Array of opportunity config objects
 */
function getOpportunityConfigs(sheetName) {
  sheetName = sheetName || 'Opportunity Tracker';
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getSheetByNameHelper(spreadsheet, sheetName);

  return parseOpportunityConfigs(sheet);
}

/**
 * Update the last sync date for an opportunity
 * @param {Sheet} sheet - Google Sheets Sheet object
 * @param {Object} config - Opportunity config with rowNumber
 * @param {Date} date - Date to set
 */
function updateLastSyncDate(sheet, config, date) {
  const LAST_SYNC_DATE_COL = 6; // Column F (1-indexed)
  const formattedDate = formatSyncDate(date);

  sheet.getRange(config.rowNumber, LAST_SYNC_DATE_COL).setValue(formattedDate);
}

/**
 * Update the status for an opportunity
 * @param {Sheet} sheet - Google Sheets Sheet object
 * @param {Object} config - Opportunity config with rowNumber
 * @param {string} status - Status value ("Processing", "Success", "Error")
 */
function updateOpportunityStatus(sheet, config, status) {
  const STATUS_COL = 7; // Column G (1-indexed)

  sheet.getRange(config.rowNumber, STATUS_COL).setValue(status);
}

/**
 * Get a sheet by name, creating it if it doesn't exist
 * @param {Spreadsheet} spreadsheet - Google Spreadsheet object
 * @param {string} name - Sheet name
 * @return {Sheet} The sheet object
 */
function getSheetByNameHelper(spreadsheet, name) {
  let sheet = spreadsheet.getSheetByName(name);

  if (!sheet) {
    // Sheet doesn't exist, create it
    sheet = spreadsheet.insertSheet(name);

    // Set up header row for new config sheet
    const headers = [
      'Opportunity Name',
      'Salesforce URL',
      'Customer Domain',
      'Gmail Labels',
      'Doc ID',
      'Last Sync Date',
      'Status',
      'Error Log'
    ];

    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f3f3f3');
  }

  return sheet;
}

/**
 * Format a date for sync timestamp
 * @param {Date} date - Date object
 * @return {string} Formatted date string (YYYY-MM-DD HH:MM:SS)
 */
function formatSyncDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Parse last sync date from string to Date object
 * @param {string} dateString - Date string from sheet
 * @return {Date|null} Date object or null if invalid
 */
function parseLastSyncDate(dateString) {
  if (!dateString) {
    return null;
  }

  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch (e) {
    return null;
  }
}
