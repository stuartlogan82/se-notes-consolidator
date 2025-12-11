# Tasks: Milestone 2 - Document Generation

**Goal:** Format and append content to Google Docs with proper structure and tracking

**Success Criteria:**
- Creates formatted sections in Google Doc
- Appends new transcripts with metadata
- Appends emails grouped by thread
- Tracks last sync date per opportunity
- Handles 2-3 test opportunities successfully

## Relevant Files

- `src/SheetConfig.js` - Google Sheet configuration management (read/write opportunity data)
- `src/DocumentFormatter.js` - Format transcripts and emails for document insertion
- `src/DocsAPI.js` - Google Docs API integration (create/update docs, append content)
- `src/Orchestrator.js` - Main processOpportunities function that coordinates the workflow
- `src/MenuSetup.js` - Custom menu creation for Google Sheets UI
- `src/ErrorLogger.js` - Error logging to spreadsheet
- `tests/SheetConfig.test.js` - Unit tests for sheet configuration
- `tests/DocumentFormatter.test.js` - Unit tests for formatting functions
- `tests/DocsAPI.test.js` - Unit tests for Docs API integration
- `tests/Orchestrator.test.js` - Unit tests for orchestration logic
- `tests/ErrorLogger.test.js` - Unit tests for error logging
- `tests/EndToEnd.test.js` - Integration tests with real Google Docs and Sheets
- `template-opportunity-tracker.csv` - Template for opportunity tracking spreadsheet
- `template-customer-doc.txt` - Template structure for customer documents

### Notes

- This is a Google Apps Script project using clasp CLI for local development
- Continue following TDD principles (test first, then implementation)
- Tests run in the Apps Script environment via the web IDE
- Use mock Google Docs/Sheets objects for unit tests to avoid quota consumption
- Integration tests will create real test documents (should be cleaned up after)

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [ ] 0.0 Create feature branch
  - [ ] 0.1 Create and checkout a new branch (e.g., `git checkout -b feature/milestone-2-document-generation`)

- [ ] 1.0 Set up Google Sheet configuration template and management
  - [ ] 1.1 Create template spreadsheet structure in Google Sheets (columns: Opportunity Name, Customer Domain, Gmail Labels, Doc ID, Last Sync Date, Status, Error Log)
  - [ ] 1.2 Write test for `getOpportunityConfigs` function (parses sheet rows into config objects)
  - [ ] 1.3 Implement `getOpportunityConfigs` function in `SheetConfig.js`
  - [ ] 1.4 Write test for `updateLastSyncDate` function (updates timestamp for specific opportunity)
  - [ ] 1.5 Implement `updateLastSyncDate` function
  - [ ] 1.6 Write test for `getSheetByName` helper (finds or creates sheet)
  - [ ] 1.7 Implement `getSheetByName` helper
  - [ ] 1.8 Create sample test data in spreadsheet (2-3 test opportunities)
  - [ ] 1.9 Run all SheetConfig tests and verify they pass
  - [ ] 1.10 Test reading and updating with real spreadsheet

- [ ] 2.0 Implement document formatting functions (TDD)
  - [ ] 2.1 Write test for `formatTranscriptSection` function (converts transcript object to formatted text with metadata)
  - [ ] 2.2 Implement `formatTranscriptSection` function in `DocumentFormatter.js`
  - [ ] 2.3 Write test for `formatEmailThreadSection` function (converts email thread to formatted text)
  - [ ] 2.4 Implement `formatEmailThreadSection` function
  - [ ] 2.5 Write test for `formatSectionHeader` function (creates section headers with emojis: 📞, 📧, etc.)
  - [ ] 2.6 Implement `formatSectionHeader` function
  - [ ] 2.7 Write test for `formatMetadata` function (formats participant lists, dates, durations)
  - [ ] 2.8 Implement `formatMetadata` function
  - [ ] 2.9 Write test for `formatContentSeparator` function (creates '---' separators between items)
  - [ ] 2.10 Implement `formatContentSeparator` function
  - [ ] 2.11 Run all DocumentFormatter tests and verify they pass (target: 100% success rate)

- [ ] 3.0 Implement Google Docs API integration (TDD)
  - [ ] 3.1 Research Google Docs API methods (DocumentApp, appendParagraph, getBody, findText)
  - [ ] 3.2 Write test for `getOrCreateDocument` function (creates doc if doesn't exist, opens if it does)
  - [ ] 3.3 Implement `getOrCreateDocument` function in `DocsAPI.js`
  - [ ] 3.4 Write test for `findSectionIndex` function (locates section by header text)
  - [ ] 3.5 Implement `findSectionIndex` function
  - [ ] 3.6 Write test for `appendToSection` function (adds content under specific section)
  - [ ] 3.7 Implement `appendToSection` function
  - [ ] 3.8 Write test for `createDocumentStructure` function (sets up initial sections: Call Transcripts, Email Correspondence, etc.)
  - [ ] 3.9 Implement `createDocumentStructure` function
  - [ ] 3.10 Write test for `appendParagraphWithFormatting` helper (handles bold, spacing)
  - [ ] 3.11 Implement `appendParagraphWithFormatting` helper
  - [ ] 3.12 Run all DocsAPI tests and verify they pass

- [ ] 4.0 Create main orchestration function
  - [ ] 4.1 Write test for `processOpportunities` function (mock all dependencies: SheetConfig, APIs, DocsAPI)
  - [ ] 4.2 Implement `processOpportunities` skeleton in `Orchestrator.js`
  - [ ] 4.3 Add logic to read opportunity configs from sheet
  - [ ] 4.4 Add logic to iterate through each opportunity with error isolation
  - [ ] 4.5 Add logic to fetch new transcripts since last sync date (using fetchFirefliesTranscripts with sinceDate)
  - [ ] 4.6 Add logic to fetch new emails since last sync date (using fetchGmailThreads with afterDate)
  - [ ] 4.7 Add logic to format transcripts and emails using DocumentFormatter
  - [ ] 4.8 Add logic to append formatted content to Google Doc
  - [ ] 4.9 Add logic to update last sync date after successful processing
  - [ ] 4.10 Add comprehensive error handling (try-catch per opportunity, continue on failure)
  - [ ] 4.11 Test orchestration function with mocked data
  - [ ] 4.12 Add deduplication check (don't append content already in doc)

- [ ] 5.0 Add custom menu and manual trigger
  - [ ] 5.1 Write `onOpen` function in `MenuSetup.js` to create custom menu
  - [ ] 5.2 Create menu items: "Run Consolidation", "View Setup Guide"
  - [ ] 5.3 Link "Run Consolidation" to `processOpportunities` function
  - [ ] 5.4 Link "View Setup Guide" to show instructions dialog
  - [ ] 5.5 Push code and verify menu appears in Google Sheets UI
  - [ ] 5.6 Test manual trigger executes processOpportunities successfully
  - [ ] 5.7 Add progress notification (toast message: "Processing X opportunities...")

- [ ] 6.0 Implement error logging and state tracking
  - [ ] 6.1 Write test for `logError` function (writes error message and timestamp to sheet error column)
  - [ ] 6.2 Implement `logError` function in `ErrorLogger.js`
  - [ ] 6.3 Write test for `updateOpportunityStatus` function (tracks processing state: "Processing", "Success", "Error")
  - [ ] 6.4 Implement `updateOpportunityStatus` function
  - [ ] 6.5 Write test for `clearErrorLog` function (clears error for successful re-runs)
  - [ ] 6.6 Implement `clearErrorLog` function
  - [ ] 6.7 Integrate error logging into orchestration function (catch blocks)
  - [ ] 6.8 Run error logging tests and verify they pass
  - [ ] 6.9 Test error logging with simulated API failures

- [ ] 7.0 End-to-end testing with real opportunities
  - [ ] 7.1 Create test Google Sheet named "Customer Consolidation - Test Config"
  - [ ] 7.2 Add 2-3 sample opportunities with real customer data (use actual domains/labels from your account)
  - [ ] 7.3 Create test Google Docs for each opportunity (name them "Test Opportunity 1 - Customer Consolidation")
  - [ ] 7.4 Configure test opportunities in sheet (paste doc URLs, set domains, labels)
  - [ ] 7.5 Set last sync date to 7 days ago to fetch recent data
  - [ ] 7.6 Run processOpportunities from custom menu
  - [ ] 7.7 Verify transcripts appear in "📞 CALL TRANSCRIPTS" section with correct formatting
  - [ ] 7.8 Verify emails appear in "📧 EMAIL CORRESPONDENCE" section with threads grouped
  - [ ] 7.9 Verify last sync dates updated to current timestamp
  - [ ] 7.10 Test error handling: add invalid doc ID, verify error logged and other opportunities continue
  - [ ] 7.11 Run processOpportunities again, verify no duplicate content appended
  - [ ] 7.12 Test with empty results (no new transcripts/emails), verify graceful handling
  - [ ] 7.13 Document test results, screenshots, and any edge cases discovered

- [ ] 8.0 Update documentation for Milestone 2
  - [ ] 8.1 Update README with "Setting Up the Opportunity Tracker" section
  - [ ] 8.2 Document spreadsheet column definitions and expected formats
  - [ ] 8.3 Document how to get Google Doc IDs from URLs
  - [ ] 8.4 Document custom menu usage ("Run Consolidation" workflow)
  - [ ] 8.5 Add examples of formatted document output (screenshots or text samples)
  - [ ] 8.6 Document error logging system and how to troubleshoot failures
  - [ ] 8.7 Update "Known Limitations" with Docs API quotas and deduplication caveats
  - [ ] 8.8 Add "End-to-End Setup Walkthrough" section with step-by-step instructions
  - [ ] 8.9 Update project status in README to reflect Milestone 2 completion
