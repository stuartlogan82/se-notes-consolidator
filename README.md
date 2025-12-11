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

**Current Status: Milestone 1 - Core Data Collection ✅**

This project fetches meeting transcripts from Fireflies.ai and email threads from Gmail, processes them, and prepares them for insertion into customer-specific Google Docs.

### Success Criteria (Milestone 1)

- ✅ Can fetch transcripts for specific date ranges
- ✅ Can fetch emails by label or domain
- ✅ API responses logged and validated
- ✅ 22/22 unit tests passing (100% success rate)
- ✅ Integration tests validated with real APIs (18 transcripts, 50 threads)

### Architecture

**Data Flow:**
1. Fetch Fireflies transcripts via GraphQL API (filtered by participants/date)
2. Fetch Gmail emails via Gmail API (filtered by labels/domains/date)
3. Parse and format content with structured sections
4. (Future) Append content to designated Google Docs

**Key Components:**
- **FirefliesAPI.js** - GraphQL client for Fireflies.ai
- **GmailAPI.js** - Wrapper for Gmail Advanced Service
- **Test Infrastructure** - TDD framework with assertion helpers and test runner

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
- `https://www.googleapis.com/auth/documents` - Access Google Docs (future)
- `https://www.googleapis.com/auth/spreadsheets` - Access Google Sheets (future)
- `https://www.googleapis.com/auth/script.external_request` - Call external APIs (Fireflies)

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

======================================
Tests: 22 passed, 0 failed, 22 total
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

### Apps Script Environment

1. **Execution Time Limit**
   - **6 minutes max** for script execution
   - Long operations must implement continuation tokens

2. **Memory Constraints**
   - Limit simultaneous processing of large datasets
   - Process in batches for 100+ transcripts/threads

3. **Timezone Handling**
   - Apps Script uses project timezone (configured in `appsscript.json`)
   - Date comparisons may have timezone-related edge cases

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
│   ├── Main.js                   # Entry point with onOpen menu
│   ├── FirefliesAPI.js           # Fireflies GraphQL integration
│   ├── GmailAPI.js               # Gmail API wrapper
│   ├── DebugFireflies.js         # Debug utilities
│   ├── appsscript.json           # OAuth scopes & config
│   └── tests/
│       ├── TestHelpers.js        # Assertion functions
│       ├── TestHelpers.test.js   # Helper tests
│       ├── TestRunner.js         # Test orchestration
│       ├── FirefliesAPI.test.js  # Fireflies unit tests
│       ├── GmailAPI.test.js      # Gmail unit tests
│       └── Integration.test.js   # Real API tests
├── tasks/
│   └── tasks-milestone-1-core-data-collection.md
├── .clasp.json                   # Clasp config (gitignored)
├── .claspignore                  # Files to exclude from push
├── .gitignore
├── CLAUDE.md                     # AI assistant guidance
├── spec.md                       # Project specification
└── README.md                     # This file
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

**Project Status:** Milestone 1 Complete ✅ | Next: Milestone 2 - Document Generation
