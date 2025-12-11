# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Google Apps Script automation that consolidates customer information from Fireflies transcripts and Gmail emails into organized Google Docs for sales engineering handoff. The system processes 10-30 active opportunities simultaneously, fetching new content and updating customer-specific docs on a daily schedule.

## Core Architecture

**Data Flow:**
1. Google Sheet acts as configuration dashboard (opportunity tracking, customer domains, Gmail labels, target doc IDs, sync timestamps)
2. Main orchestration function iterates through opportunities in the sheet
3. For each opportunity:
   - Fetch new Fireflies transcripts via GraphQL API (filtered by participants/date)
   - Fetch Gmail emails via Gmail API (filtered by labels/domains/date)
   - Format and append content to designated Google Doc with structured sections
   - Update last sync timestamp in tracking sheet

**Key Components:**
- **API Integration Layer:** Fireflies GraphQL client, Gmail API wrapper
- **Configuration Manager:** Reads/writes Google Sheet rows (opportunity name, domain, labels, doc ID, last sync date)
- **Document Formatter:** Generates structured sections with emojis (📞 Call Transcripts, 📧 Email Correspondence, 🔧 Technical Requirements, 📅 Timeline & Commitments)
- **Orchestration Controller:** Main loop that processes opportunities with error isolation (failure in one opportunity doesn't stop others)

**Authentication:**
- Apps Script OAuth handles Google Workspace APIs automatically
- Fireflies API key stored in Script Properties (`PropertiesService.getScriptProperties()`)

**Execution Model:**
- Time-based trigger runs daily (typically 8am)
- Manual trigger available via custom menu in Google Sheets UI
- Must complete within 6-minute Apps Script quota

## Development Commands

Since this is a Google Apps Script project, development happens in the Apps Script IDE or via clasp CLI:

**Using clasp (Google Apps Script CLI):**
```bash
# Install clasp globally if not already installed
npm install -g @google/clasp

# Login to Google account
clasp login

# Create new Apps Script project
clasp create --type standalone --title "Customer Consolidation"

# Push local code to Apps Script
clasp push

# Pull remote code to local
clasp pull

# Open project in browser
clasp open
```

**Script Properties Setup:**
```javascript
// Run once to configure API keys
function setupScriptProperties() {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty('FIREFLIES_API_KEY', 'your-api-key-here');
}
```

## Test-Driven Development

**This project uses TDD to catch bugs early and ensure reliability.** Write tests before implementation for each component.

### Test Structure

Organize tests in a `tests/` directory mirroring the source structure:
```
src/
  FirefliesAPI.js
  GmailAPI.js
  DocumentFormatter.js
  ConfigManager.js
  Main.js
tests/
  FirefliesAPI.test.js
  GmailAPI.test.js
  DocumentFormatter.test.js
  ConfigManager.test.js
  Main.test.js
  TestRunner.js
```

### Testing Framework

Use Google Apps Script's native testing approach with QUnit or a simple custom test runner:

```javascript
// tests/TestRunner.js
function runAllTests() {
  const results = [];

  // Run test suites
  results.push(...testFirefliesAPI());
  results.push(...testGmailAPI());
  results.push(...testDocumentFormatter());

  // Log results
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  Logger.log(`Tests: ${passed} passed, ${failed} failed`);

  return results;
}
```

### TDD Workflow

**For each new function/feature:**

1. **Write the test first** (Red phase)
   ```javascript
   // tests/FirefliesAPI.test.js
   function testFetchTranscripts() {
     const mockResponse = {
       data: { transcripts: [{ id: '123', title: 'Test Meeting' }] }
     };

     // Mock the API call
     const result = parseFirefliesResponse(mockResponse);

     assertEqual(result.length, 1);
     assertEqual(result[0].id, '123');
     assertEqual(result[0].title, 'Test Meeting');
   }
   ```

2. **Write minimal code to pass** (Green phase)
   ```javascript
   // src/FirefliesAPI.js
   function parseFirefliesResponse(response) {
     return response.data.transcripts.map(t => ({
       id: t.id,
       title: t.title
     }));
   }
   ```

3. **Refactor while keeping tests green**

4. **Run tests after every change**

### Testing Patterns

**Mock External APIs:**
```javascript
// Don't hit real APIs in tests
function testFetchFirefliesTranscripts() {
  // Save original function
  const originalFetch = UrlFetchApp.fetch;

  // Mock UrlFetchApp.fetch
  UrlFetchApp.fetch = function(url, options) {
    return {
      getContentText: () => JSON.stringify({
        data: { transcripts: [/* mock data */] }
      })
    };
  };

  // Run test
  const result = fetchFirefliesTranscripts('2025-01-01');
  assertEqual(result.length, 1);

  // Restore original
  UrlFetchApp.fetch = originalFetch;
}
```

**Test Pure Functions First:**
```javascript
// Easier to test - no side effects
function formatTranscriptSection(transcript) {
  return `${transcript.title} - ${transcript.date}\n` +
         `Participants: ${transcript.participants.join(', ')}\n` +
         `Duration: ${transcript.duration} min\n\n` +
         `${transcript.content}`;
}

// Test it
function testFormatTranscriptSection() {
  const input = {
    title: 'Q4 Planning',
    date: '2025-01-15',
    participants: ['Alice', 'Bob'],
    duration: 45,
    content: 'Meeting notes...'
  };

  const result = formatTranscriptSection(input);
  assertContains(result, 'Q4 Planning');
  assertContains(result, 'Alice, Bob');
  assertContains(result, '45 min');
}
```

**Test Error Handling:**
```javascript
function testHandleAPIFailure() {
  // Mock failed API response
  const errorResponse = { error: 'Invalid API key' };

  try {
    handleFirefliesResponse(errorResponse);
    fail('Should have thrown error');
  } catch (e) {
    assertEqual(e.message, 'Fireflies API error: Invalid API key');
  }
}
```

**Test Idempotency:**
```javascript
function testDeduplication() {
  const transcripts = [
    { id: '123', title: 'Meeting 1' },
    { id: '123', title: 'Meeting 1' }, // duplicate
    { id: '456', title: 'Meeting 2' }
  ];

  const deduplicated = removeDuplicateTranscripts(transcripts);
  assertEqual(deduplicated.length, 2);
  assertEqual(deduplicated[0].id, '123');
  assertEqual(deduplicated[1].id, '456');
}
```

### Running Tests

**In Apps Script Editor:**
1. Open script in browser: `clasp open`
2. Select `runAllTests` from function dropdown
3. Click Run
4. View results in Execution log

**Locally (if using clasp):**
```bash
# Push code to Apps Script
clasp push

# Open in browser and run tests manually
clasp open
```

**CI/CD (Advanced):**
Use `clasp run` with Apps Script API to execute tests programmatically:
```bash
clasp run runAllTests
```

### Test Coverage Goals

- **API Integration Layer:** 100% of parsing/formatting logic
- **Document Formatter:** 100% of string generation functions
- **Configuration Manager:** All CRUD operations on sheet data
- **Orchestration:** Error isolation, continuation logic
- **Edge Cases:** Empty responses, malformed data, API errors, quota exceeded

### Helper Functions

```javascript
// tests/TestHelpers.js
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      `${message || 'Assertion failed'}: expected ${expected}, got ${actual}`
    );
  }
}

function assertContains(string, substring) {
  if (!string.includes(substring)) {
    throw new Error(`Expected "${string}" to contain "${substring}"`);
  }
}

function fail(message) {
  throw new Error(message);
}
```

### Benefits for This Project

1. **API Reliability:** Mock responses ensure API parsing works before hitting rate limits
2. **Document Format Consistency:** Test formatters produce correct structure every time
3. **Deduplication Works:** Verify idempotency logic prevents duplicate content
4. **Error Isolation:** Confirm one opportunity's failure doesn't crash the batch
5. **Refactoring Confidence:** Change code safely knowing tests will catch regressions

## Design Constraints

**Idempotency:** All operations must be safe to run multiple times. Implement deduplication logic to prevent appending duplicate transcripts or emails to docs. Track content by unique identifiers (transcript ID, email message ID).

**Error Isolation:** Wrap each opportunity's processing in try-catch. Log errors to spreadsheet error column and continue to next opportunity. Never let one customer's failure stop the batch.

**Quota Management:**
- Apps Script enforces 6-minute execution limit
- Gmail API has read quotas (10,000/day for standard accounts)
- Batch operations where possible; implement continuation tokens if processing exceeds time limits

## Document Structure

Each opportunity's Google Doc follows this template:

```
[OPPORTUNITY NAME] - Customer Consolidation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 CALL TRANSCRIPTS

[Meeting Title] - Dec 10, 2025
Participants: John (Customer), Sarah (8x8)
Duration: 45 min

[Transcript content with speaker labels...]

---

📧 EMAIL CORRESPONDENCE

Thread: "Technical Questions" (3 messages)
Dec 8-10, 2025

From: john@customer.com
Subject: Integration requirements
Date: Dec 8, 2025 2:30 PM

[Email body...]

---

🔧 TECHNICAL REQUIREMENTS
[Manual notes section - ready for future AI extraction]

---

📅 TIMELINE & COMMITMENTS
[Manual notes section - ready for future AI extraction]
```

**Section Management:** Append new content chronologically within each section. Include metadata (participants, duration, subjects, dates) before content. Use `---` separators between items.

## Code Conventions

**Naming:**
- Functions: `camelCase` (e.g., `fetchFirefliesTranscripts`, `processOpportunities`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `FIREFLIES_API_URL`, `GMAIL_SEARCH_LIMIT`)
- Sheet names: Title Case (e.g., "Opportunity Tracker")

**Error Handling Pattern:**
```javascript
try {
  // API call or operation
} catch (error) {
  Logger.log(`Error processing ${opportunityName}: ${error.message}`);
  // Log to spreadsheet error column
  // Continue to next opportunity
}
```

**Configuration-Driven:** All opportunity-specific data lives in the Google Sheet, not hardcoded in scripts. Functions accept configuration objects, not hardcoded values.

## Migration Path

This implementation (Solution 2) is designed for future AI enhancement (Solution 3):
- Keep data collection and document generation modular
- Technical Requirements and Timeline sections are ready for AI-extracted content
- Future: Add Claude API step to extract structured data from transcripts/emails before document updates
- Current: Full transcripts/emails stored; AI will later parse and populate dedicated sections automatically
