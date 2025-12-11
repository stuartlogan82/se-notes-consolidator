# PROJECT SPEC: Customer Consolidation Automation (Solution 2)

## What We're Building

A Google Apps Script automation that consolidates customer information from Fireflies transcripts and Gmail emails into organized Google Docs for implementation handoff.

**Core Functionality:**
- Pulls new Fireflies meeting transcripts via API
- Fetches relevant Gmail emails via API
- Updates customer-specific Google Docs with formatted content
- Organizes information into structured sections
- Runs automatically on schedule (daily)

**Control System:**
- Google Sheet acts as configuration dashboard
- Track opportunities, customer domains, Gmail labels, target docs
- Manual trigger available via custom menu

## Requirements

### Functional Requirements
1. **Data Collection**
   - Fetch Fireflies transcripts for meetings with specific participants
   - Fetch Gmail emails matching labels or sender domains
   - Filter by date range (only new content since last sync)

2. **Document Generation**
   - Create/update Google Docs with consistent formatting
   - Organize content into sections: Call Transcripts, Email Correspondence, Technical Requirements, Timeline & Commitments
   - Maintain chronological order within sections
   - Add timestamps and metadata (participants, subject lines, dates)

3. **Configuration Management**
   - Spreadsheet-based config for each opportunity
   - Track: Opportunity Name, Customer Email Domain, Gmail Labels, Doc ID, Last Sync Date
   - Support 10-30 active opportunities simultaneously

4. **Error Handling**
   - Log errors to spreadsheet or separate log sheet
   - Continue processing other opportunities if one fails
   - Validate API responses before updating docs

### Non-Functional Requirements
- Run within Google Apps Script quotas (6 min execution time, API limits)
- Simple enough for non-developers to configure
- Extensible for future AI enhancement (Solution 3 migration path)

## Tech Stack

**Core Platform:**
- Google Apps Script (JavaScript runtime)
- Google Workspace APIs (Gmail, Docs, Sheets)

**External APIs:**
- Fireflies.ai GraphQL API
- Gmail API (OAuth 2.0)
- Google Docs API

**Storage:**
- Google Sheets (configuration + state management)
- Google Docs (output documents)

**Authentication:**
- Apps Script OAuth for Google services (automatic)
- Fireflies API key (stored in Script Properties)

## Design Guidelines

### Code Organization
- **Modular functions:** Separate concerns (API calls, formatting, doc updates)
- **Configuration-driven:** All opportunity-specific data in spreadsheet, not hardcoded
- **Idempotent operations:** Safe to run multiple times without duplicating content

### Document Structure
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

### Naming Conventions
- Functions: `camelCase` (e.g., `fetchFirefliesTranscripts`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `FIREFLIES_API_URL`)
- Sheet names: Title Case (e.g., "Opportunity Tracker")

### Error Handling Pattern
```javascript
try {
  // API call or operation
} catch (error) {
  Logger.log(`Error processing ${opportunityName}: ${error.message}`);
  // Log to spreadsheet error column
  // Continue to next opportunity
}
```

## Milestones

### Milestone 1: Core Data Collection (Week 1)
**Goal:** Successfully fetch data from Fireflies and Gmail APIs

**Deliverables:**
- Apps Script project created
- Fireflies API integration working (GraphQL queries)
- Gmail API integration working (search and fetch)
- Script Properties configured (API keys)
- Test functions to validate API responses

**Success Criteria:**
- Can fetch transcripts for specific date range
- Can fetch emails by label or domain
- API responses logged and validated

---

### Milestone 2: Document Generation (Week 2)
**Goal:** Format and append content to Google Docs

**Deliverables:**
- Google Sheet configuration template
- Document formatting functions
- Main orchestration function (`processOpportunities`)
- Custom menu in Sheets for manual trigger
- Error logging to spreadsheet

**Success Criteria:**
- Creates formatted sections in Google Doc
- Appends new transcripts with metadata
- Appends emails grouped by thread
- Tracks last sync date per opportunity
- Handles 2-3 test opportunities successfully

---

### Milestone 3: Production Deployment (Week 3)
**Goal:** Automated, production-ready system

**Deliverables:**
- Time-based trigger (daily 8am execution)
- Deduplication logic (don't append same content twice)
- User documentation (setup guide, troubleshooting)
- Template Google Doc with sections pre-created
- Error notifications (optional: email on failure)

**Success Criteria:**
- Runs daily without manual intervention
- Processes 10+ opportunities in single execution
- No duplicate content in docs
- Sales engineer can add new opportunities via spreadsheet
- Ready for 30-day production trial

---

## Migration Path to Solution 3 (Future)

This implementation is designed to make future AI enhancement easy:

1. **Data Collection:** Already structured (transcripts, emails separated)
2. **Document Sections:** Technical Requirements and Timeline sections ready for AI-extracted content
3. **API Integration:** Fireflies/Gmail APIs already working, just add Claude API
4. **Workflow:** Add AI processing step before document update

**Future Enhancement:**
- Send transcript text to Claude API with extraction prompt
- Receive structured JSON (technical requirements, timeline, decisions, stakeholders)
- Auto-populate dedicated sections instead of manual notes
- Keep full transcripts/emails in appendix
