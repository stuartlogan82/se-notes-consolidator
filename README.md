# Customer Consolidation - SE Notes Consolidator

A Google Apps Script automation that consolidates customer information from Fireflies transcripts and Gmail emails into organized Google Docs for sales engineering handoff.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [API Usage](#api-usage)
- [Known Limitations](#known-limitations)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

## 🎯 Project Overview

**Current Status: Milestone 2 - Document Generation ✅**

This project automates customer information consolidation by fetching meeting transcripts from Fireflies.ai and email threads from Gmail, then organizing them into structured Google Docs for sales engineering handoff. The system processes 10-30 active opportunities simultaneously, updating customer-specific docs on a daily schedule.

### Success Criteria (Milestone 2)

- ✅ Creates formatted sections in Google Docs with emoji headers
- ✅ Appends new transcripts and emails with metadata
- ✅ Tracks last sync date per opportunity
- ✅ Custom menu for manual triggering
- ✅ Error logging with auto-clear on success
- ✅ 78/78 unit tests passing (100% success rate)
- ✅ Complete document generation workflow operational

### Architecture

**Data Flow:**
1. Google Sheet acts as configuration dashboard (opportunity tracking, domains, labels, doc IDs)
2. Main orchestration function iterates through opportunities
3. For each opportunity:
   - Fetch new Fireflies transcripts since last sync
   - Fetch new Gmail emails since last sync
   - Format content with structured sections
   - Append to designated Google Doc
   - Update sync timestamp and status

**Key Components:**
- **FirefliesAPI.js** - GraphQL client for Fireflies.ai
- **GmailAPI.js** - Gmail API wrapper with label/domain filtering
- **SheetConfig.js** - Google Sheet configuration management
- **DocumentFormatter.js** - Content formatting with emoji sections
- **DocsAPI.js** - Google Docs API integration
- **Orchestrator.js** - Main workflow coordination with error isolation
- **MenuSetup.js** - Custom menu and UI interactions
- **Test Infrastructure** - 78 tests across all components (100% coverage)

## ⚙️ Prerequisites

1. **Google Account** with access to:
   - Google Apps Script
   - Gmail
   - Apps Script API enabled

2. **Fireflies.ai Account** with API access:
   - Sign up at [fireflies.ai](https://fireflies.ai)
   - Generate API key from Settings → Integrations → API

3. **Development Tools:**
   - Node.js (v14 or higher)
   - npm or yarn
   - Git

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/stuartlogan82/se-notes-consolidator.git
cd se-notes-consolidator
```

### Step 2: Install Clasp CLI

Clasp is Google's CLI for Apps Script development.

```bash
# Install as dev dependency (recommended if IT restricts global installs)
npm install --save-dev @google/clasp

# Or install globally
npm install -g @google/clasp
```

### Step 3: Enable Apps Script API

1. Visit https://script.google.com/home/usersettings
2. Enable "Google Apps Script API"
3. Wait 1-2 minutes for propagation

### Step 4: Login to Google Account

```bash
# If installed locally
npx clasp login

# If installed globally
clasp login
```

This opens a browser window for OAuth authentication.

### Step 5: Create Apps Script Project

```bash
npx clasp create --type standalone --title "Customer Consolidation"
```

This creates:
- A new Apps Script project in your Google Drive
- `.clasp.json` file (gitignored, contains project ID)

### Step 6: Push Code to Apps Script

```bash
npx clasp push --force
```

This uploads all files from `src/` to Apps Script.

### Step 7: Verify Project

```bash
npx clasp open
```

Opens the Apps Script IDE in your browser.

## 🔐 Configuration

### Configure Fireflies API Key

1. Get your API key from [Fireflies.ai Settings](https://app.fireflies.ai/integrations/custom/api)

2. In the Apps Script IDE:
   - Open `FirefliesAPI.gs`
   - Find the `setupFirefliesAPIKey()` function
   - Replace `'YOUR_API_KEY_HERE'` with your actual API key:

```javascript
function setupFirefliesAPIKey() {
  const apiKey = 'ff_sk_your_actual_api_key_here';
  PropertiesService.getScriptProperties().setProperty('FIREFLIES_API_KEY', apiKey);
  Logger.log('✓ Fireflies API key configured successfully');
}
```

3. Run `setupFirefliesAPIKey` from the function dropdown
4. Check the execution log for success message
5. **Security:** Delete your API key from the code after running (it's now stored in Script Properties)

### Gmail Configuration

No additional configuration needed! Gmail access uses your Google account's OAuth automatically through the Apps Script environment.

### Required OAuth Scopes

These are pre-configured in `appsscript.json`:

- `https://www.googleapis.com/auth/gmail.readonly` - Read Gmail
- `https://www.googleapis.com/auth/documents` - Access Google Docs
- `https://www.googleapis.com/auth/spreadsheets` - Access Google Sheets
- `https://www.googleapis.com/auth/script.external_request` - Call external APIs (Fireflies)

## 📊 Setting Up the Opportunity Tracker

### Step 1: Create the Opportunity Tracker Sheet

1. **Open your Google Sheet** (or create a new one)
2. **Create a sheet named** `Opportunity Tracker` (exact name required)
3. **Add the following column headers** in row 1:

| Column | Header Name | Description | Required | Format |
|--------|------------|-------------|----------|--------|
| A | Opportunity Name | Name of the sales opportunity | Yes | Text (e.g., "Acme Corp Q4 Deal") |
| B | Salesforce URL | Link to Salesforce opportunity | Yes | Full URL (e.g., "https://8x8.lightning.force.com/lightning/r/Opportunity/...") |
| C | Customer Domain | Customer's email domain for filtering | Yes | Domain only (e.g., "acme.com") |
| D | Gmail Labels | Gmail labels to filter emails | Yes | Comma-separated (e.g., "customer-support,trial") |
| E | Doc ID | Google Doc ID for this opportunity | Optional* | Doc ID from URL (leave empty for new docs) |
| F | Last Sync Date | Last successful sync timestamp | Auto | YYYY-MM-DD HH:MM:SS (auto-updated) |
| G | Status | Processing status | Auto | "Processing", "Success", or "Error" (auto-updated) |
| H | Error Log | Error messages if processing fails | Auto | Timestamped error message (auto-updated) |

**\*Note:** If Doc ID is empty, a new Google Doc will be created automatically on first run.

### Step 2: Get Google Doc IDs

For existing Google Docs, you need to extract the Document ID from the URL:

**Google Doc URL Format:**
```
https://docs.google.com/document/d/1XjKc8vZ9AbCdEfGhIjKlMnOpQrStUvWx/edit
                                  └──────────────────────────────┘
                                         This is the Doc ID
```

**How to get the Doc ID:**
1. Open the Google Doc in your browser
2. Look at the URL in the address bar
3. Copy the long string between `/d/` and `/edit`
4. Paste it into the "Doc ID" column

**Example:**
- Full URL: `https://docs.google.com/document/d/1XjKc8vZ9AbCdEfGhIjKlMnOpQrStUvWx/edit`
- Doc ID to copy: `1XjKc8vZ9AbCdEfGhIjKlMnOpQrStUvWx`

### Step 3: Add Opportunities

Add one row per opportunity with the following information:

**Example Configuration:**

```csv
Opportunity Name,Salesforce URL,Customer Domain,Gmail Labels,Doc ID,Last Sync Date,Status,Error Log
Acme Corp Q4 Deal,https://8x8.lightning.force.com/lightning/r/Opportunity/0061234567890ABC/view,acme.com,customer-support,1XjKc8vZ9AbCdEfGhIjKlMnOpQrStUvWx,2025-01-10 08:00:00,Success,
TechCo Integration Trial,https://8x8.lightning.force.com/lightning/r/Opportunity/0061234567890DEF/view,techco.io,"trial,integration",2YkLd9wA0BcDeFgHiJkLmNoPqRsTuVwXy,2025-01-09 08:00:00,Success,
Global Systems POC,https://8x8.lightning.force.com/lightning/r/Opportunity/0061234567890GHI/view,globalsystems.com,poc,,,,
```

**Tips:**
- **Customer Domain:** Use the main email domain (e.g., `acme.com` not `john@acme.com`)
- **Gmail Labels:** Use exact label names from Gmail (case-sensitive)
- **Multiple Labels:** Separate with commas, no spaces (e.g., `trial,integration,poc`)
- **New Docs:** Leave Doc ID empty for new opportunities - system will create doc and update ID
- **Salesforce URL:** Use the full Lightning Experience URL from your browser

### Step 4: Format Gmail Labels

The system uses Gmail labels to filter customer emails. Make sure your Gmail labels are set up:

1. **In Gmail:** Create labels for customer interactions (e.g., `customer-support`, `trial`, `poc`)
2. **Apply labels** to relevant customer email threads
3. **Use same label names** in the Opportunity Tracker "Gmail Labels" column

**Common Gmail Label Strategies:**
- By customer: `acme-corp`, `techco`
- By stage: `discovery`, `trial`, `implementation`
- By type: `customer-support`, `technical-questions`
- Combined: `acme-corp,technical-questions`

## 🚀 Using the System

### Running Consolidation Manually

Once your Opportunity Tracker is set up:

1. **Open your Google Sheet** with the Opportunity Tracker
2. **Look for the custom menu** in the menu bar: **"Customer Consolidation"**
3. **Click** "Customer Consolidation" → "Run Consolidation"
4. **Wait for processing** (progress notification will appear)
5. **Review results** in the completion dialog

**What happens during processing:**
- System reads all opportunities from the tracker
- For each opportunity:
  - Fetches new transcripts from Fireflies (since last sync)
  - Fetches new emails from Gmail (since last sync)
  - Creates or opens the Google Doc
  - Appends formatted content to appropriate sections
  - Updates Last Sync Date, Status, and Error Log columns
- Shows summary: "X processed, Y successful, Z failed"

### Understanding Document Structure

Each customer document follows this format:

```
[OPPORTUNITY NAME] - Customer Consolidation

Salesforce Opportunity: [clickable link]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 CALL TRANSCRIPTS

[Meeting Title] - Dec 10, 2025
Participants: John (Customer), Sarah (8x8)
Duration: 45 min

[Transcript content with speaker labels...]

---

📧 EMAIL CORRESPONDENCE

Thread: "Technical Questions" (3 messages)

From: john@customer.com
Date: Dec 8, 2025 2:30 PM
Subject: Integration requirements

[Email body...]

---

🔧 TECHNICAL REQUIREMENTS
[Empty section - ready for manual notes or future AI extraction]

---

📅 TIMELINE & COMMITMENTS
[Empty section - ready for manual notes or future AI extraction]
```

**Section Descriptions:**
- **📞 CALL TRANSCRIPTS:** All Fireflies meeting transcripts with this customer
- **📧 EMAIL CORRESPONDENCE:** Email threads filtered by domain and labels
- **🔧 TECHNICAL REQUIREMENTS:** Manual notes section (reserved for future AI extraction)
- **📅 TIMELINE & COMMITMENTS:** Manual notes section (reserved for future AI extraction)

### Viewing Setup Guide

Click "Customer Consolidation" → "View Setup Guide" to see in-app setup instructions.

### Checking Last Run Results

Click "Customer Consolidation" → "View Last Run Summary" to see:
- Last execution timestamp
- Number of opportunities processed
- Success/failure counts

### Scheduling Automatic Runs

To run consolidation automatically on a schedule:

1. **Open Apps Script IDE:** Click "Extensions" → "Apps Script"
2. **Open Triggers:** Click the clock icon ⏰ in the left sidebar
3. **Add Trigger:**
   - Choose function: `processOpportunities`
   - Event source: Time-driven
   - Type: Day timer
   - Time of day: 8am-9am (recommended)
4. **Save** the trigger

**Recommended Schedule:**
- **Daily at 8am** - Ensures fresh data each morning
- **Avoid weekends** - Use "Every weekday" option
- **Avoid peak hours** - Early morning reduces API contention

### Understanding Status and Error Logs

The Opportunity Tracker automatically updates three columns:

**Status Column:**
- **Processing** - Currently being processed
- **Success** - Last run completed successfully
- **Error** - Last run failed (see Error Log for details)

**Error Log Column:**
- **Empty** - No errors
- **[Timestamp] Error message** - Shows what went wrong
- **Auto-clears** - Cleared automatically on next successful run

**Common Error Messages:**
- "Document not found" - Invalid Doc ID or doc was deleted
- "API connection failed" - Fireflies or Gmail API temporarily unavailable
- "Permission denied" - Doc sharing settings prevent script access
- "Opportunity Tracker sheet not found" - Sheet name must be exactly "Opportunity Tracker"

## 🧪 Running Tests

### Unit Tests (Apps Script IDE)

1. Open your project: `npx clasp open`
2. Select `runAllTests` from the function dropdown
3. Click **Run**
4. View results in **Execution log** (Ctrl/Cmd + Enter)

**Expected Output:**
```
======================================
Running All Tests
======================================

--- Testing Test Helpers ---
✓ assertEqual passes with equal values
✓ assertEqual throws with different values
✓ assertContains passes when substring present
✓ assertContains throws when substring missing
✓ fail throws error with message

--- Testing Fireflies API ---
✓ parseFirefliesResponse handles valid single transcript
✓ parseFirefliesResponse handles multiple transcripts
✓ parseFirefliesResponse handles empty transcripts
✓ parseFirefliesResponse throws on malformed response
✓ parseFirefliesResponse formats transcript text
✓ buildFirefliesGraphQLQuery includes limit
✓ buildFirefliesGraphQLQuery includes all required fields

--- Testing Gmail API ---
✓ buildGmailSearchQuery includes label
✓ buildGmailSearchQuery includes domain filter
✓ buildGmailSearchQuery includes date range
✓ buildGmailSearchQuery combines multiple filters
✓ buildGmailSearchQuery includes specific sender email
✓ parseGmailThreads handles single thread
✓ parseGmailThreads formats thread text
✓ parseGmailThreads handles empty array
✓ formatGmailDate formats date consistently

--- Testing SheetConfig ---
✓ parseOpportunityConfigs parses single label correctly
✓ parseOpportunityConfigs handles multiple labels
✓ updateLastSyncDate updates correct cell
✓ updateOpportunityStatus sets Processing status
✓ getSheetByName finds existing sheet
✓ logError writes error with timestamp
✓ clearErrorLog clears error log
[... 17 total SheetConfig tests ...]

--- Testing DocumentFormatter ---
✓ formatDocumentHeader includes opportunity name and link
✓ formatTranscriptSection includes title, date, duration
✓ formatEmailThreadSection includes subject and message count
✓ formatSectionHeader includes emoji for Call Transcripts
✓ formatMetadata formats participant list
✓ formatContentSeparator creates dash separator
✓ formatParticipants formats multiple participants
[... 20 total DocumentFormatter tests ...]

--- Testing DocsAPI ---
✓ getOrCreateDocument opens existing doc by ID
✓ getOrCreateDocument creates new doc if ID empty
✓ findSectionIndex finds Call Transcripts section
✓ appendToSection inserts content after section
✓ createDocumentStructure creates all sections
✓ appendParagraphWithFormatting sets text
✓ setDocumentHeader includes opportunity name
[... 15 total DocsAPI tests ...]

--- Testing Orchestrator ---
✓ processOpportunities handles all opportunities
✓ processOpportunities isolates errors per opportunity
✓ processOpportunities handles empty results gracefully
✓ processOpportunities creates structure for new docs

======================================
Tests: 78 passed, 0 failed, 78 total
Success rate: 100.0%
======================================
```

### Integration Tests (Real APIs)

**Warning:** These consume API quotas and require valid credentials.

#### Test Fireflies Integration

```javascript
// In Apps Script IDE, run:
testFirefliesIntegration()
```

**Expected Output:**
```
=== Testing Fireflies Integration ===
Fetching transcripts since [30 days ago]...
✓ Successfully fetched 18 transcripts

First transcript details:
  ID: transcript-id-123
  Title: Customer Discovery Call
  Date: 2025-01-15
  Duration: 45 minutes
  Participants: john@customer.com, sarah@8x8.com
  Sentences: 342
  Transcript preview: John: We're interested in your API integration...

✓ Fireflies integration test passed
```

#### Test Gmail Integration

```javascript
// In Apps Script IDE, run:
testGmailIntegration()
```

**Expected Output:**
```
=== Testing Gmail Integration ===
Fetching Gmail threads since [7 days ago]...
✓ Successfully fetched 50 threads

First thread details:
  Subject: Technical Integration Questions
  Message Count: 3
  First Message From: John Doe <john@customer.com>
  First Message Date: Jan 15, 2025, 10:30 AM
  Thread preview: We need help with the API integration...

✓ Gmail integration test passed
```

### Quick Test

To verify test infrastructure is working:

```javascript
// In Apps Script IDE, run:
quickTest()
```

## 📚 API Usage

### Fetch Fireflies Transcripts

```javascript
// Fetch transcripts from last 30 days
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const transcripts = fetchFirefliesTranscripts({
  sinceDate: thirtyDaysAgo,
  limit: 50
});

Logger.log(`Fetched ${transcripts.length} transcripts`);

// Access transcript data
transcripts.forEach(transcript => {
  Logger.log(`${transcript.title} - ${transcript.date}`);
  Logger.log(`Participants: ${transcript.participants.join(', ')}`);
  Logger.log(`Duration: ${transcript.durationMinutes} minutes`);
  Logger.log(`Content: ${transcript.formattedTranscript}`);
});
```

**Options:**
- `sinceDate` (Date) - Only transcripts after this date
- `participantEmail` (string) - Filter by participant email
- `limit` (number) - Max transcripts to fetch (default: 50)

**Response Format:**
```javascript
{
  id: 'transcript-id-123',
  title: 'Customer Discovery Call',
  date: '2025-01-15',
  durationMinutes: 45,
  participants: ['john@customer.com', 'sarah@8x8.com'],
  sentences: [
    { speaker_name: 'John', text: 'Hello', start_time: 0 },
    { speaker_name: 'Sarah', text: 'Hi John', start_time: 3 }
  ],
  formattedTranscript: 'John: Hello\nSarah: Hi John\n...'
}
```

### Fetch Gmail Threads

```javascript
// Fetch emails from last 7 days
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

const threads = fetchGmailThreads({
  afterDate: sevenDaysAgo,
  label: 'customer-support'
});

Logger.log(`Fetched ${threads.length} threads`);

// Access thread data
threads.forEach(thread => {
  Logger.log(`Subject: ${thread.subject}`);
  Logger.log(`Messages: ${thread.messageCount}`);

  thread.messages.forEach(message => {
    Logger.log(`From: ${message.from}`);
    Logger.log(`Date: ${message.dateFormatted}`);
    Logger.log(`Body: ${message.body}`);
  });
});
```

**Options:**
- `afterDate` (Date) - Only emails after this date
- `beforeDate` (Date) - Only emails before this date
- `label` (string) - Filter by Gmail label (e.g., 'INBOX', 'customer-support')
- `fromDomain` (string) - Filter by sender domain (e.g., 'customer.com')
- `fromEmail` (string) - Filter by specific sender email

**Response Format:**
```javascript
{
  subject: 'Technical Integration Questions',
  messageCount: 3,
  messages: [
    {
      from: 'John Doe <john@customer.com>',
      to: 'support@8x8.com',
      date: Date object,
      dateFormatted: 'Jan 15, 2025, 10:30 AM',
      subject: 'Technical Integration Questions',
      body: 'We need help with...'
    }
  ],
  formattedThread: 'Thread: Technical Integration Questions...'
}
```

### Example: Successful API Responses

**Fireflies Response (18 transcripts fetched):**
```
{
  "data": {
    "transcripts": [
      {
        "id": "abc123",
        "title": "Q4 Planning Call",
        "dateString": "2025-01-10",
        "duration": 2700,
        "participants": ["alice@customer.com", "bob@8x8.com"],
        "sentences": [
          {
            "speaker_name": "Alice",
            "text": "Let's discuss our integration timeline.",
            "start_time": 0
          }
        ]
      }
    ]
  }
}
```

**Gmail Response (50 threads fetched):**
```
GmailThread objects with properties:
- getFirstMessageSubject() → "Technical Questions"
- getMessageCount() → 3
- getMessages() → Array of GmailMessage objects
  - getFrom() → "john@customer.com"
  - getTo() → "support@8x8.com"
  - getDate() → Date object
  - getSubject() → "Re: Technical Questions"
  - getPlainBody() → Email content
```

## ⚠️ Known Limitations

### Fireflies API

1. **GraphQL Filters Don't Work**
   - Date filters (`date_eq`, `date_gte`) return 0 results
   - Participant filters (`user_email`) return 0 results
   - **Workaround:** Fetch all recent transcripts (up to 50), filter in-memory

2. **Rate Limits**
   - Unknown official limits (not documented)
   - Observed: Works reliably for fetching 50 transcripts
   - Recommendation: Avoid rapid repeated requests

3. **Data Freshness**
   - New transcripts may take 5-10 minutes to appear via API
   - Check Fireflies dashboard to verify transcript is fully processed

### Gmail API

1. **Quota Limits**
   - **Standard accounts:** 10,000 read operations/day
   - **Google Workspace:** Higher limits
   - **Recommendation:** Batch operations, avoid frequent full scans

2. **Search Limitations**
   - Max 500 threads per search (Apps Script limitation)
   - Date searches use `YYYY/MM/DD` format
   - Label names are case-sensitive

3. **Thread Size**
   - Very long threads (100+ messages) may be truncated
   - Plain text body extraction may miss rich formatting

### Google Docs API

1. **Quota Limits**
   - **Read requests:** 60,000/minute per user
   - **Write requests:** 60/minute per user (this is the bottleneck)
   - **Recommendation:** Process 30-50 opportunities max per run
   - **Daily batch processing** recommended over frequent updates

2. **Document Size**
   - Very large documents (500+ pages) may slow down processing
   - Consider archiving old content to separate docs annually

3. **Concurrent Access**
   - Script updates and manual editing can conflict
   - **Best practice:** Don't manually edit docs during script execution
   - Auto-saved changes are preserved, but may cause formatting issues

4. **Content Deduplication**
   - System uses `lastSyncDate` to fetch only new content
   - **Caveat:** If a transcript is re-processed in Fireflies, it may appear as "new"
   - **Workaround:** System includes content IDs in future iterations for exact deduplication

### Google Sheets API

1. **Cell Update Quotas**
   - Unlimited reads for owner
   - 100 requests/100 seconds/user for writes
   - Current implementation: ~5 writes per opportunity (well within limits)

### Apps Script Environment

1. **Execution Time Limit**
   - **6 minutes max** for script execution
   - Current implementation: ~5-10 seconds per opportunity
   - Can process ~30-40 opportunities per run safely

2. **Memory Constraints**
   - Limit simultaneous processing of large datasets
   - Process in batches for 100+ transcripts/threads
   - Current implementation handles typical workloads (10-30 opportunities)

3. **Timezone Handling**
   - Apps Script uses project timezone (configured in `appsscript.json`)
   - All timestamps use local timezone consistently
   - Date comparisons handle timezone correctly

4. **Error Isolation**
   - One opportunity's failure doesn't stop batch processing
   - Errors logged to spreadsheet Error Log column with timestamps
   - Status column tracks: Processing → Success/Error
   - Auto-clears errors on successful re-runs

## 🔧 Troubleshooting

### Common Issues

#### "Apps Script API is not enabled"

**Error:**
```
User has not enabled the Apps Script API. Enable it by visiting...
```

**Solution:**
1. Visit https://script.google.com/home/usersettings
2. Turn on "Google Apps Script API"
3. Wait 1-2 minutes for changes to propagate
4. Retry `npx clasp login` or `npx clasp create`

---

#### "FIREFLIES_API_KEY not configured"

**Error when running tests:**
```
✗ FIREFLIES_API_KEY not configured
Run setupFirefliesAPIKey("your-api-key") first
```

**Solution:**
1. Edit `FirefliesAPI.gs`
2. Update `setupFirefliesAPIKey()` with your actual key
3. Run the function in Apps Script IDE
4. Delete key from code after running

---

#### "Syntax error: Unexpected string" in setupFirefliesAPIKey

**Error:**
```
Syntax error: SyntaxError: Unexpected string line: 11 file: FirefliesAPI.gs
```

**Cause:** Trying to pass API key as function parameter.

**Solution:** Edit the `const apiKey = '...'` line inside the function instead.

---

#### Fireflies Returns 0 Transcripts (but they exist)

**Symptoms:**
- `testFirefliesIntegration()` returns 0 transcripts
- You can see transcripts in Fireflies dashboard

**Diagnosis:**
```javascript
// Run in Apps Script IDE:
testMinimalQuery()
```

**Common Causes:**
1. **GraphQL filters not working** - Remove date/email filters, use in-memory filtering
2. **API key invalid** - Verify key in Fireflies.ai settings
3. **Transcripts too new** - Wait 10 minutes after meeting ends
4. **API account access** - Ensure API access enabled in Fireflies plan

**Solution:** Current implementation uses in-memory filtering (already fixed).

---

#### Gmail Tests Fail with Date Errors

**Error:**
```
✗ buildGmailSearchQuery includes date range - Expected "..." to contain "2025/01/15"
```

**Cause:** Timezone parsing issues with `new Date('2025-01-15')`.

**Solution:** Use explicit Date constructor:
```javascript
// Instead of:
const date = new Date('2025-01-15');

// Use:
const date = new Date(2025, 0, 15); // Year, Month (0-indexed), Day
```

---

#### Permission Denied for npm install -g

**Error:**
```
EACCES: permission denied, mkdir '/usr/local/lib/node_modules/@google'
```

**Solution:** Install locally instead:
```bash
npm install --save-dev @google/clasp
npx clasp login  # Use npx prefix for all commands
```

---

#### Tests Pass but Integration Tests Fail

**Check API Credentials:**
```javascript
// In Apps Script IDE, run:
validateFirefliesSetup()
```

**Verify OAuth Scopes:**
1. Open Apps Script IDE
2. Click "Run" on any function
3. Review authorization dialog
4. Ensure all scopes are granted

---

#### Rate Limit Exceeded

**Gmail Error:**
```
User rate limit exceeded. [429]
```

**Solution:**
- Wait 1 hour
- Reduce batch sizes
- Implement exponential backoff
- Use date filters to narrow searches

---

### Debug Utilities

#### Debug Fireflies Query

```javascript
// In Apps Script IDE, run:
debugFirefliesQuery()
```

Shows raw GraphQL query and response structure.

#### Introspect Fireflies Schema

```javascript
// In Apps Script IDE, run:
introspectFirefliesSchema()
```

Lists available GraphQL fields and types.

#### Validate Setup

```javascript
// Quick validation:
validateFirefliesSetup()  // Checks API key configured
quickTest()               // Verifies test infrastructure
```

## 💻 Development

### Project Structure

```
se-notes-consolidator/
├── src/
│   ├── Main.js                     # Legacy entry point
│   ├── FirefliesAPI.js             # Fireflies GraphQL integration
│   ├── GmailAPI.js                 # Gmail API wrapper
│   ├── SheetConfig.js              # Google Sheet configuration management
│   ├── DocumentFormatter.js        # Content formatting with emoji sections
│   ├── DocsAPI.js                  # Google Docs API integration
│   ├── Orchestrator.js             # Main workflow coordination
│   ├── MenuSetup.js                # Custom menu and UI
│   ├── DebugFireflies.js           # Debug utilities
│   ├── appsscript.json             # OAuth scopes & config
│   └── tests/
│       ├── TestHelpers.js          # Assertion functions
│       ├── TestHelpers.test.js     # Helper tests
│       ├── TestRunner.js           # Test orchestration (78 tests)
│       ├── FirefliesAPI.test.js    # Fireflies unit tests (7 tests)
│       ├── GmailAPI.test.js        # Gmail unit tests (8 tests)
│       ├── SheetConfig.test.js     # SheetConfig unit tests (17 tests)
│       ├── DocumentFormatter.test.js  # Formatter unit tests (20 tests)
│       ├── DocsAPI.test.js         # DocsAPI unit tests (15 tests)
│       ├── Orchestrator.test.js    # Orchestrator unit tests (4 tests)
│       └── Integration.test.js     # Real API tests
├── tasks/
│   ├── tasks-milestone-1-core-data-collection.md
│   └── tasks-milestone-2-document-generation.md
├── template-opportunity-tracker.csv  # Spreadsheet template
├── .clasp.json                     # Clasp config (gitignored)
├── .claspignore                    # Files to exclude from push
├── .gitignore
├── CLAUDE.md                       # AI assistant guidance
├── spec.md                         # Project specification
└── README.md                       # This file
```

### TDD Workflow

This project follows strict Test-Driven Development:

1. **Write test first** (Red phase)
2. **Implement minimal code** (Green phase)
3. **Refactor** while keeping tests green
4. **Run tests after every change**

See [CLAUDE.md](CLAUDE.md) for detailed TDD guidelines.

### Development Commands

```bash
# Push local changes to Apps Script
npx clasp push

# Pull remote changes from Apps Script
npx clasp pull

# Open project in browser
npx clasp open

# View logs
npx clasp logs

# Show project info
npx clasp status
```

### Git Workflow

```bash
# Feature branch development
git checkout -b feature/your-feature-name

# Commit with co-authorship
git commit -m "feat: add new feature

🤖 Generated with Claude Code

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to remote
git push origin feature/your-feature-name
```

## 📖 Additional Resources

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Clasp CLI Documentation](https://github.com/google/clasp)
- [Fireflies.ai API Documentation](https://docs.fireflies.ai/)
- [Gmail Search Operators](https://support.google.com/mail/answer/7190)
- [Project Specification](spec.md)
- [CLAUDE.md](CLAUDE.md) - AI Development Guidelines

## 📝 License

This project is internal to 8x8 for sales engineering automation.

## 👥 Contributors

- Stuart Logan (stuart.logan@8x8.com)
- Claude Sonnet 4.5 (AI Pair Programming Assistant)

---

**Project Status:** Milestone 2 Complete ✅ | Next: Milestone 3 - AI Enhancement (Future)
