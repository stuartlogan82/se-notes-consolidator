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

- [x] 3.0 Implement Fireflies API integration (TDD)
  - [x] 3.1 Research Fireflies GraphQL API documentation and identify required query structure for fetching transcripts
  - [x] 3.2 Write test for `parseFirefliesResponse` function (with mock GraphQL response data)
  - [x] 3.3 Implement `parseFirefliesResponse` function to parse GraphQL response and extract transcript data
  - [x] 3.4 Write test for `buildFirefliesGraphQLQuery` function (should build proper GraphQL query with date filters)
  - [x] 3.5 Implement `buildFirefliesGraphQLQuery` function
  - [x] 3.6 Implement `fetchFirefliesTranscripts` function that makes GraphQL API call (includes error handling)
  - [x] 3.7 Implement error handling for Fireflies API errors with descriptive error messages
  - [x] 3.8 Run all Fireflies tests and verify they pass (15/15 tests passed, 100% success rate)
  - [x] 3.9 Configure Fireflies API key in Script Properties
  - [x] 3.10 Manually test with real Fireflies API - Successfully fetched 18 transcripts with full content

- [x] 4.0 Implement Gmail API integration (TDD)
  - [x] 4.1 Research Gmail API search syntax and filtering options (labels, domains, date ranges)
  - [x] 4.2 Write test for `buildGmailSearchQuery` function (should build proper search query string)
  - [x] 4.3 Implement `buildGmailSearchQuery` function
  - [x] 4.4 Write test for `parseGmailThreads` function (with mock GmailThread data)
  - [x] 4.5 Implement `parseGmailThreads` function to extract messages and metadata
  - [x] 4.6 Implement `fetchGmailThreads` function that searches and retrieves threads
  - [x] 4.7 Implement error handling for Gmail API errors
  - [x] 4.8 Run all Gmail tests and verify they pass (22/22 tests passed, 100% success rate)
  - [x] 4.9 Manually test with real Gmail API - Successfully fetched 50 threads with full message content

- [x] 5.0 Create configuration management for Script Properties
  - [x] 5.1 Write test for `getScriptProperty` function (with mocked PropertiesService)
  - [x] 5.2 Implement `getScriptProperty` function with error handling for missing properties
  - [x] 5.3 Write test for `setScriptProperty` function
  - [x] 5.4 Implement `setScriptProperty` function
  - [x] 5.5 Create `setupScriptProperties` function for initial configuration setup (setupFirefliesAPIKey)
  - [x] 5.6 Document required Script Properties (FIREFLIES_API_KEY, etc.) in comments and README

- [x] 6.0 Create integration test suite and validation functions
  - [x] 6.1 Create `testFirefliesIntegration` function that tests end-to-end Fireflies flow with real API
  - [x] 6.2 Create `testGmailIntegration` function that tests end-to-end Gmail flow with real API
  - [x] 6.3 Create `validateAPIResponses` function that logs API response structure for debugging (DebugFireflies.js)
  - [x] 6.4 Run integration tests with real APIs and verify Milestone 1 success criteria are met (18 transcripts, 50 threads)
  - [x] 6.5 Document test results, API quirks discovered, and any rate limiting observations (GraphQL filter limitations documented)

- [x] 7.0 Document setup and usage instructions
  - [x] 7.1 Create/update `README.md` with setup instructions (clasp installation, project creation)
  - [x] 7.2 Document how to configure Script Properties with API keys
  - [x] 7.3 Document how to run tests in Apps Script IDE
  - [x] 7.4 Document known limitations, API quotas, and rate limits
  - [x] 7.5 Include examples of successful API responses for reference
  - [x] 7.6 Add troubleshooting section for common issues
