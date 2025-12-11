# Tasks: Milestone 1 - Core Data Collection

**Goal:** Successfully fetch data from Fireflies and Gmail APIs

**Success Criteria:**
- Can fetch transcripts for specific date range
- Can fetch emails by label or domain
- API responses logged and validated

## Relevant Files

- `src/FirefliesAPI.js` - Fireflies GraphQL API integration functions
- `src/GmailAPI.js` - Gmail API integration functions
- `src/ConfigManager.js` - Script Properties configuration management
- `tests/TestHelpers.js` - Test assertion functions (assertEqual, assertContains, fail)
- `tests/TestRunner.js` - Main test runner that executes all test suites
- `tests/FirefliesAPI.test.js` - Unit tests for Fireflies integration
- `tests/GmailAPI.test.js` - Unit tests for Gmail integration
- `tests/ConfigManager.test.js` - Unit tests for configuration management
- `tests/Integration.test.js` - End-to-end integration tests with real APIs
- `appsscript.json` - Apps Script manifest configuration
- `.clasp.json` - Clasp CLI configuration (gitignored, environment-specific)
- `README.md` - Setup documentation and usage instructions

### Notes

- This is a Google Apps Script project using clasp CLI for local development
- All tests should be written following TDD principles (test first, then implementation)
- Tests run in the Apps Script environment via the web IDE
- Use mock data for external API calls in tests to avoid hitting rate limits

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch (e.g., `git checkout -b feature/milestone-1-api-integration`)

- [x] 1.0 Initialize Google Apps Script project with clasp
  - [x] 1.1 Install clasp locally as dev dependency (`npm install --save-dev @google/clasp`)
  - [x] 1.2 Login to Google account via clasp (`npx clasp login`)
  - [x] 1.3 Create new Apps Script project (`npx clasp create --type standalone --title "Customer Consolidation"`)
  - [x] 1.4 Create project directory structure (create `src/` and `tests/` directories)
  - [x] 1.5 Create `appsscript.json` manifest file with required scopes (Gmail, Docs, Sheets, UrlFetch)
  - [x] 1.6 Push initial structure to Apps Script (`npx clasp push --force`)
  - [x] 1.7 Open project in browser and verify it exists (`npx clasp open`)

- [x] 2.0 Set up test infrastructure and helper functions
  - [x] 2.1 Write test for `assertEqual` helper function in `tests/TestHelpers.test.js`
  - [x] 2.2 Implement `assertEqual` function in `tests/TestHelpers.js`
  - [x] 2.3 Write test for `assertContains` helper function
  - [x] 2.4 Implement `assertContains` function
  - [x] 2.5 Write test for `fail` helper function
  - [x] 2.6 Implement `fail` function
  - [x] 2.7 Create `tests/TestRunner.js` with `runAllTests` function that aggregates test results
  - [x] 2.8 Test the TestRunner by running a simple test suite (quickTest: 3/3 passed)
  - [x] 2.9 Push test infrastructure to Apps Script and verify it runs in the web IDE (runAllTests: 6/6 passed, 100% success rate)

- [ ] 3.0 Implement Fireflies API integration (TDD)
  - [ ] 3.1 Research Fireflies GraphQL API documentation and identify required query structure for fetching transcripts
  - [ ] 3.2 Write test for `parseFirefliesResponse` function (with mock GraphQL response data)
  - [ ] 3.3 Implement `parseFirefliesResponse` function to parse GraphQL response and extract transcript data
  - [ ] 3.4 Write test for `buildFirefliesGraphQLQuery` function (should build proper GraphQL query with date filters)
  - [ ] 3.5 Implement `buildFirefliesGraphQLQuery` function
  - [ ] 3.6 Write test for `fetchFirefliesTranscripts` function (with mocked `UrlFetchApp.fetch`)
  - [ ] 3.7 Implement `fetchFirefliesTranscripts` function that makes GraphQL API call
  - [ ] 3.8 Write test for error handling in Fireflies integration (invalid API key, malformed response, network errors)
  - [ ] 3.9 Implement error handling for Fireflies API errors with descriptive error messages
  - [ ] 3.10 Run all Fireflies tests and verify they pass (`runAllTests` in Apps Script IDE)
  - [ ] 3.11 Manually test with real Fireflies API using test credentials and log response structure

- [ ] 4.0 Implement Gmail API integration (TDD)
  - [ ] 4.1 Research Gmail API search syntax and filtering options (labels, domains, date ranges)
  - [ ] 4.2 Write test for `buildGmailSearchQuery` function (should build proper search query string)
  - [ ] 4.3 Implement `buildGmailSearchQuery` function
  - [ ] 4.4 Write test for `parseGmailThreads` function (with mock GmailThread data)
  - [ ] 4.5 Implement `parseGmailThreads` function to extract messages and metadata
  - [ ] 4.6 Write test for `fetchGmailThreads` function (with mocked `GmailApp.search`)
  - [ ] 4.7 Implement `fetchGmailThreads` function that searches and retrieves threads
  - [ ] 4.8 Write test for error handling in Gmail integration (quota exceeded, invalid search, empty results)
  - [ ] 4.9 Implement error handling for Gmail API errors
  - [ ] 4.10 Run all Gmail tests and verify they pass
  - [ ] 4.11 Manually test with real Gmail API using test account and log response structure

- [ ] 5.0 Create configuration management for Script Properties
  - [ ] 5.1 Write test for `getScriptProperty` function (with mocked PropertiesService)
  - [ ] 5.2 Implement `getScriptProperty` function with error handling for missing properties
  - [ ] 5.3 Write test for `setScriptProperty` function
  - [ ] 5.4 Implement `setScriptProperty` function
  - [ ] 5.5 Create `setupScriptProperties` function for initial configuration setup
  - [ ] 5.6 Document required Script Properties (FIREFLIES_API_KEY, etc.) in comments and README

- [ ] 6.0 Create integration test suite and validation functions
  - [ ] 6.1 Create `testFirefliesIntegration` function that tests end-to-end Fireflies flow with real API
  - [ ] 6.2 Create `testGmailIntegration` function that tests end-to-end Gmail flow with real API
  - [ ] 6.3 Create `validateAPIResponses` function that logs API response structure for debugging
  - [ ] 6.4 Run integration tests with real APIs and verify Milestone 1 success criteria are met
  - [ ] 6.5 Document test results, API quirks discovered, and any rate limiting observations

- [ ] 7.0 Document setup and usage instructions
  - [ ] 7.1 Create/update `README.md` with setup instructions (clasp installation, project creation)
  - [ ] 7.2 Document how to configure Script Properties with API keys
  - [ ] 7.3 Document how to run tests in Apps Script IDE
  - [ ] 7.4 Document known limitations, API quotas, and rate limits
  - [ ] 7.5 Include examples of successful API responses for reference
  - [ ] 7.6 Add troubleshooting section for common issues
