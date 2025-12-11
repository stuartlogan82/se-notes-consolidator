/**
 * DocsAPI.js
 * Google Docs API integration for creating and updating documents
 */

/**
 * Get or create a Google Doc
 * @param {string} docId - Document ID (empty to create new)
 * @param {string} docName - Document name for new docs
 * @return {Document} Google Doc object
 */
function getOrCreateDocument(docId, docName) {
  return getOrCreateDocumentHelper(DocumentApp, docId, docName);
}

/**
 * Helper function for getting or creating document (for testing)
 * @param {Object} documentApp - DocumentApp or mock
 * @param {string} docId - Document ID
 * @param {string} docName - Document name
 * @return {Document} Google Doc object
 */
function getOrCreateDocumentHelper(documentApp, docId, docName) {
  if (docId && docId.trim() !== '') {
    try {
      return documentApp.openById(docId);
    } catch (e) {
      Logger.log('Could not open doc ' + docId + ', creating new: ' + e.message);
      return documentApp.create(docName);
    }
  }

  // No docId provided, create new
  return documentApp.create(docName);
}

/**
 * Set document header with opportunity name and Salesforce link
 * @param {Document} doc - Google Doc object
 * @param {Object} config - Config with opportunityName and salesforceUrl
 */
function setDocumentHeader(doc, config) {
  const body = doc.getBody();
  const header = formatDocumentHeader(config);
  const lines = header.split('\n');

  // Insert header lines at the beginning
  lines.forEach(function(line, index) {
    const para = body.insertParagraph(index, line);

    // Make Salesforce URL clickable
    if (line.includes(config.salesforceUrl)) {
      const text = para.editAsText();
      const start = line.indexOf(config.salesforceUrl);
      const end = start + config.salesforceUrl.length - 1;
      text.setLinkUrl(start, end, config.salesforceUrl);
    }

    // Make title bold
    if (line.includes('Customer Consolidation')) {
      para.editAsText().setBold(0, line.length - 1, true);
    }
  });
}

/**
 * Find the index of a section by header text
 * @param {Body} body - Document body
 * @param {string} sectionName - Section name (e.g., "CALL TRANSCRIPTS")
 * @return {number} Paragraph index or -1 if not found
 */
function findSectionIndex(body, sectionName) {
  const paragraphs = body.getParagraphs();

  for (var i = 0; i < paragraphs.length; i++) {
    const text = paragraphs[i].getText();
    if (text.includes(sectionName)) {
      return i;
    }
  }

  return -1;
}

/**
 * Append content to a specific section
 * @param {Body} body - Document body
 * @param {string} sectionName - Section name
 * @param {string} content - Content to append
 * @return {boolean} Success status
 */
function appendToSection(body, sectionName, content) {
  const sectionIndex = findSectionIndex(body, sectionName);

  if (sectionIndex === -1) {
    Logger.log('Section not found: ' + sectionName);
    return false;
  }

  // Insert after section header and empty line
  const insertIndex = sectionIndex + 2;

  // Split content by lines and insert each
  const lines = content.split('\n');
  lines.forEach(function(line, offset) {
    body.insertParagraph(insertIndex + offset, line);
  });

  return true;
}

/**
 * Create initial document structure with all sections
 * @param {Document} doc - Google Doc object
 * @param {Object} config - Config with opportunityName and salesforceUrl
 */
function createDocumentStructure(doc, config) {
  const body = doc.getBody();

  // Clear existing content
  body.clear();

  // Add header
  setDocumentHeader(doc, config);

  // Add sections
  const sections = [
    'CALL TRANSCRIPTS',
    'EMAIL CORRESPONDENCE',
    'TECHNICAL REQUIREMENTS',
    'TIMELINE & COMMITMENTS'
  ];

  sections.forEach(function(sectionName) {
    const header = formatSectionHeader(sectionName);

    const para = body.appendParagraph(header);
    para.editAsText().setBold(0, header.length - 1, true);

    // Add empty line after each section
    body.appendParagraph('');
  });
}

/**
 * Append paragraph with formatting options
 * @param {Paragraph} paragraph - Paragraph object
 * @param {string} text - Text content
 * @param {Object} options - Formatting options (bold, url)
 */
function appendParagraphWithFormatting(paragraph, text, options) {
  options = options || {};

  paragraph.setText(text);

  const editableText = paragraph.editAsText();

  if (options.bold) {
    editableText.setBold(0, text.length - 1, true);
  }

  if (options.url) {
    editableText.setLinkUrl(0, text.length - 1, options.url);
  }
}

/**
 * Append transcript to Call Transcripts section
 * @param {Document} doc - Google Doc object
 * @param {Object} transcript - Transcript object from Fireflies
 */
function appendTranscript(doc, transcript) {
  const body = doc.getBody();
  const formattedContent = formatTranscriptSection(transcript);
  const separator = formatContentSeparator();

  appendToSection(body, 'CALL TRANSCRIPTS', formattedContent + separator);
}

/**
 * Append email thread to Email Correspondence section
 * @param {Document} doc - Google Doc object
 * @param {Object} thread - Email thread object from Gmail
 */
function appendEmailThread(doc, thread) {
  const body = doc.getBody();
  const formattedContent = formatEmailThreadSection(thread);
  const separator = formatContentSeparator();

  appendToSection(body, 'EMAIL CORRESPONDENCE', formattedContent + separator);
}
