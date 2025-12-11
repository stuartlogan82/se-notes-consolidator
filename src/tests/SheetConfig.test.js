/**
 * Tests for SheetConfig.js
 * Following TDD: Write tests first, then implement
 */

function testGetOpportunityConfigs() {
  const tests = [];

  // Mock SpreadsheetApp data
  const mockSheet = {
    getName: function() { return 'Opportunity Tracker'; },
    getLastRow: function() { return 4; }, // Header + 3 data rows
    getRange: function(row, col, numRows, numCols) {
      // Return mock range with test data
      return {
        getValues: function() {
          if (row === 1 && numRows === 1) {
            // Header row
            return [['Opportunity Name', 'Salesforce URL', 'Customer Domain', 'Gmail Labels', 'Doc ID', 'Last Sync Date', 'Status', 'Error Log']];
          } else {
            // Data rows (rows 2-4)
            return [
              ['Acme Corp Q4 Deal', 'https://8x8.lightning.force.com/opp/123', 'acme.com', 'customer-support', '1XjKc8vZ', '2025-01-10 08:00:00', 'Success', ''],
              ['TechCo Trial', 'https://8x8.lightning.force.com/opp/456', 'techco.io', 'trial,integration', '2YkLd9wA', '2025-01-09 08:00:00', 'Success', ''],
              ['Global Systems', 'https://8x8.lightning.force.com/opp/789', 'globalsystems.com', 'poc', '3ZlMe0xB', '', '', '']
            ];
          }
        }
      };
    }
  };

  // Test 1: Parse opportunity configs from sheet
  try {
    const configs = parseOpportunityConfigs(mockSheet);

    assertEqual(configs.length, 3);
    assertEqual(configs[0].opportunityName, 'Acme Corp Q4 Deal');
    assertEqual(configs[0].salesforceUrl, 'https://8x8.lightning.force.com/opp/123');
    assertEqual(configs[0].customerDomain, 'acme.com');
    assertEqual(configs[0].gmailLabels, 'customer-support');
    assertEqual(configs[0].docId, '1XjKc8vZ');
    assertEqual(configs[0].lastSyncDate, '2025-01-10 08:00:00');
    assertEqual(configs[0].status, 'Success');

    tests.push({ name: 'parseOpportunityConfigs parses single label correctly', passed: true });
  } catch (e) {
    tests.push({ name: 'parseOpportunityConfigs parses single label correctly', passed: false, error: e.message });
  }

  // Test 2: Parse multiple Gmail labels
  try {
    const configs = parseOpportunityConfigs(mockSheet);

    assertEqual(configs[1].gmailLabels, 'trial,integration');

    tests.push({ name: 'parseOpportunityConfigs handles multiple labels', passed: true });
  } catch (e) {
    tests.push({ name: 'parseOpportunityConfigs handles multiple labels', passed: false, error: e.message });
  }

  // Test 3: Handle empty optional fields
  try {
    const configs = parseOpportunityConfigs(mockSheet);

    assertEqual(configs[2].lastSyncDate, '');
    assertEqual(configs[2].status, '');

    tests.push({ name: 'parseOpportunityConfigs handles empty optional fields', passed: true });
  } catch (e) {
    tests.push({ name: 'parseOpportunityConfigs handles empty optional fields', passed: false, error: e.message });
  }

  // Test 4: Include row number for updates
  try {
    const configs = parseOpportunityConfigs(mockSheet);

    assertEqual(configs[0].rowNumber, 2); // First data row
    assertEqual(configs[1].rowNumber, 3);
    assertEqual(configs[2].rowNumber, 4);

    tests.push({ name: 'parseOpportunityConfigs includes row numbers', passed: true });
  } catch (e) {
    tests.push({ name: 'parseOpportunityConfigs includes row numbers', passed: false, error: e.message });
  }

  return tests;
}

function testUpdateLastSyncDate() {
  const tests = [];

  // Mock sheet for updates
  let lastUpdatedRange = null;
  let lastUpdatedValue = null;

  const mockSheet = {
    getRange: function(row, col) {
      return {
        setValue: function(value) {
          lastUpdatedRange = { row: row, col: col };
          lastUpdatedValue = value;
        }
      };
    }
  };

  // Test 1: Update last sync date for specific row
  try {
    const config = {
      opportunityName: 'Acme Corp',
      rowNumber: 2
    };

    const testDate = new Date('2025-01-15T10:30:00Z');
    updateLastSyncDate(mockSheet, config, testDate);

    // Column 6 is "Last Sync Date" (F column)
    assertEqual(lastUpdatedRange.row, 2);
    assertEqual(lastUpdatedRange.col, 6);
    assertContains(lastUpdatedValue, '2025');
    assertContains(lastUpdatedValue, '01');
    assertContains(lastUpdatedValue, '15');

    tests.push({ name: 'updateLastSyncDate updates correct cell', passed: true });
  } catch (e) {
    tests.push({ name: 'updateLastSyncDate updates correct cell', passed: false, error: e.message });
  }

  // Test 2: Format date consistently
  try {
    const config = { rowNumber: 3 };
    const testDate = new Date('2025-01-15T14:45:30Z');

    updateLastSyncDate(mockSheet, config, testDate);

    // Should include time component
    assertContains(lastUpdatedValue, ':');

    tests.push({ name: 'updateLastSyncDate formats date with time', passed: true });
  } catch (e) {
    tests.push({ name: 'updateLastSyncDate formats date with time', passed: false, error: e.message });
  }

  return tests;
}

function testUpdateOpportunityStatus() {
  const tests = [];

  // Mock sheet for status updates
  let lastUpdatedRange = null;
  let lastUpdatedValue = null;

  const mockSheet = {
    getRange: function(row, col) {
      return {
        setValue: function(value) {
          lastUpdatedRange = { row: row, col: col };
          lastUpdatedValue = value;
        }
      };
    }
  };

  // Test 1: Update status to "Processing"
  try {
    const config = { rowNumber: 2 };
    updateOpportunityStatus(mockSheet, config, 'Processing');

    // Column 7 is "Status" (G column)
    assertEqual(lastUpdatedRange.row, 2);
    assertEqual(lastUpdatedRange.col, 7);
    assertEqual(lastUpdatedValue, 'Processing');

    tests.push({ name: 'updateOpportunityStatus sets Processing status', passed: true });
  } catch (e) {
    tests.push({ name: 'updateOpportunityStatus sets Processing status', passed: false, error: e.message });
  }

  // Test 2: Update status to "Success"
  try {
    const config = { rowNumber: 3 };
    updateOpportunityStatus(mockSheet, config, 'Success');

    assertEqual(lastUpdatedValue, 'Success');

    tests.push({ name: 'updateOpportunityStatus sets Success status', passed: true });
  } catch (e) {
    tests.push({ name: 'updateOpportunityStatus sets Success status', passed: false, error: e.message });
  }

  // Test 3: Update status to "Error"
  try {
    const config = { rowNumber: 4 };
    updateOpportunityStatus(mockSheet, config, 'Error');

    assertEqual(lastUpdatedValue, 'Error');

    tests.push({ name: 'updateOpportunityStatus sets Error status', passed: true });
  } catch (e) {
    tests.push({ name: 'updateOpportunityStatus sets Error status', passed: false, error: e.message });
  }

  return tests;
}

function testGetSheetByName() {
  const tests = [];

  // Mock SpreadsheetApp
  const mockSpreadsheet = {
    sheets: [
      { getName: function() { return 'Sheet1'; } },
      { getName: function() { return 'Opportunity Tracker'; } }
    ],
    getSheetByName: function(name) {
      const found = this.sheets.find(s => s.getName() === name);
      return found || null;
    },
    insertSheet: function(name) {
      const newSheet = { getName: function() { return name; } };
      this.sheets.push(newSheet);
      return newSheet;
    }
  };

  // Test 1: Find existing sheet
  try {
    const sheet = getSheetByNameHelper(mockSpreadsheet, 'Opportunity Tracker');

    assertEqual(sheet.getName(), 'Opportunity Tracker');

    tests.push({ name: 'getSheetByName finds existing sheet', passed: true });
  } catch (e) {
    tests.push({ name: 'getSheetByName finds existing sheet', passed: false, error: e.message });
  }

  // Test 2: Create sheet if not found
  try {
    // Need to add getRange mock for header setup
    mockSpreadsheet.insertSheet = function(name) {
      const newSheet = {
        getName: function() { return name; },
        getRange: function(row, col, numRows, numCols) {
          return {
            setValues: function() {},
            setFontWeight: function() {},
            setBackground: function() {}
          };
        }
      };
      this.sheets.push(newSheet);
      return newSheet;
    };

    const sheet = getSheetByNameHelper(mockSpreadsheet, 'New Config Sheet');

    assertEqual(sheet.getName(), 'New Config Sheet');
    assertEqual(mockSpreadsheet.sheets.length, 3); // Original 2 + new one

    tests.push({ name: 'getSheetByName creates sheet if not found', passed: true });
  } catch (e) {
    tests.push({ name: 'getSheetByName creates sheet if not found', passed: false, error: e.message });
  }

  return tests;
}

function testFormatSyncDate() {
  const tests = [];

  // Test 1: Format date to string
  try {
    // Use local time to avoid timezone conversion issues
    const date = new Date(2025, 0, 15, 10, 30, 0); // Jan 15, 2025, 10:30:00 local time
    const formatted = formatSyncDate(date);

    assertContains(formatted, '2025');
    assertContains(formatted, '01');
    assertContains(formatted, '15');
    assertContains(formatted, '10');
    assertContains(formatted, '30');

    tests.push({ name: 'formatSyncDate formats date with time', passed: true });
  } catch (e) {
    tests.push({ name: 'formatSyncDate formats date with time', passed: false, error: e.message });
  }

  // Test 2: Consistent format
  try {
    const date = new Date('2025-12-25T23:59:59Z');
    const formatted = formatSyncDate(date);

    // Should follow YYYY-MM-DD HH:MM:SS pattern
    assertContains(formatted, '2025-12-25');

    tests.push({ name: 'formatSyncDate uses consistent format', passed: true });
  } catch (e) {
    tests.push({ name: 'formatSyncDate uses consistent format', passed: false, error: e.message });
  }

  return tests;
}

function testLogError() {
  const tests = [];

  // Mock sheet
  const mockSheet = {
    getRange: function(row, col) {
      return {
        setValue: function(value) {
          this.value = value;
          mockSheet.lastSetValue = value;
          mockSheet.lastSetRow = row;
          mockSheet.lastSetCol = col;
        }
      };
    },
    lastSetValue: null,
    lastSetRow: null,
    lastSetCol: null
  };

  // Test 1: Log error with timestamp
  try {
    const config = { rowNumber: 2, opportunityName: 'Test Opp' };
    logError(mockSheet, config, 'API connection failed');

    // Should write to error log column (8)
    assertEqual(mockSheet.lastSetCol, 8);
    assertEqual(mockSheet.lastSetRow, 2);

    // Should include error message
    assertContains(mockSheet.lastSetValue, 'API connection failed');

    // Should include timestamp in brackets
    assertContains(mockSheet.lastSetValue, '[');
    assertContains(mockSheet.lastSetValue, ']');

    tests.push({ name: 'logError writes error with timestamp', passed: true });
  } catch (e) {
    tests.push({ name: 'logError writes error with timestamp', passed: false, error: e.message });
  }

  // Test 2: Log error to correct row
  try {
    const config = { rowNumber: 5, opportunityName: 'Another Opp' };
    logError(mockSheet, config, 'Document not found');

    assertEqual(mockSheet.lastSetRow, 5);
    assertContains(mockSheet.lastSetValue, 'Document not found');

    tests.push({ name: 'logError writes to correct row', passed: true });
  } catch (e) {
    tests.push({ name: 'logError writes to correct row', passed: false, error: e.message });
  }

  return tests;
}

function testClearErrorLog() {
  const tests = [];

  // Mock sheet
  const mockSheet = {
    getRange: function(row, col) {
      return {
        setValue: function(value) {
          this.value = value;
          mockSheet.lastSetValue = value;
          mockSheet.lastSetRow = row;
          mockSheet.lastSetCol = col;
        }
      };
    },
    lastSetValue: null,
    lastSetRow: null,
    lastSetCol: null
  };

  // Test 1: Clear error log sets empty string
  try {
    const config = { rowNumber: 3, opportunityName: 'Test Opp' };
    clearErrorLog(mockSheet, config);

    // Should write to error log column (8)
    assertEqual(mockSheet.lastSetCol, 8);
    assertEqual(mockSheet.lastSetRow, 3);

    // Should set empty string
    assertEqual(mockSheet.lastSetValue, '');

    tests.push({ name: 'clearErrorLog clears error log', passed: true });
  } catch (e) {
    tests.push({ name: 'clearErrorLog clears error log', passed: false, error: e.message });
  }

  // Test 2: Clear error log for different rows
  try {
    const config = { rowNumber: 7, opportunityName: 'Another Opp' };
    clearErrorLog(mockSheet, config);

    assertEqual(mockSheet.lastSetRow, 7);
    assertEqual(mockSheet.lastSetValue, '');

    tests.push({ name: 'clearErrorLog works for any row', passed: true });
  } catch (e) {
    tests.push({ name: 'clearErrorLog works for any row', passed: false, error: e.message });
  }

  return tests;
}
