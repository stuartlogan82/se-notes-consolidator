/**
 * Tests for DocsAPI.js
 * Following TDD: Write tests first, then implement
 */

function testGetOrCreateDocument() {
  const tests = [];

  // Mock DocumentApp
  const mockDocumentApp = {
    documents: [],
    openById: function(id) {
      const found = this.documents.find(d => d.id === id);
      if (!found) {
        throw new Error('Document not found: ' + id);
      }
      return found;
    },
    create: function(name) {
      const newDoc = {
        id: 'new-doc-' + this.documents.length,
        name: name,
        getId: function() { return this.id; },
        getName: function() { return this.name; }
      };
      this.documents.push(newDoc);
      return newDoc;
    }
  };

  // Test 1: Open existing document by ID
  try {
    const existingDoc = { id: 'doc-123', getId: function() { return this.id; } };
    mockDocumentApp.documents.push(existingDoc);

    const doc = getOrCreateDocumentHelper(mockDocumentApp, 'doc-123', 'Test Doc');

    assertEqual(doc.getId(), 'doc-123');

    tests.push({ name: 'getOrCreateDocument opens existing doc by ID', passed: true });
  } catch (e) {
    tests.push({ name: 'getOrCreateDocument opens existing doc by ID', passed: false, error: e.message });
  }

  // Test 2: Create new document if ID is empty
  try {
    const doc = getOrCreateDocumentHelper(mockDocumentApp, '', 'New Test Doc');

    assertEqual(doc.getName(), 'New Test Doc');

    tests.push({ name: 'getOrCreateDocument creates new doc if ID empty', passed: true });
  } catch (e) {
    tests.push({ name: 'getOrCreateDocument creates new doc if ID empty', passed: false, error: e.message });
  }

  // Test 3: Create new document if ID is invalid
  try {
    const doc = getOrCreateDocumentHelper(mockDocumentApp, 'invalid-id', 'Fallback Doc');

    assertEqual(doc.getName(), 'Fallback Doc');

    tests.push({ name: 'getOrCreateDocument creates new doc if ID invalid', passed: true });
  } catch (e) {
    tests.push({ name: 'getOrCreateDocument creates new doc if ID invalid', passed: false, error: e.message });
  }

  return tests;
}

function testFindSectionIndex() {
  const tests = [];

  // Mock document body
  const mockBody = {
    paragraphs: [
      { getText: function() { return 'Acme Corp - Customer Consolidation'; } },
      { getText: function() { return ''; } },
      { getText: function() { return '📞 CALL TRANSCRIPTS'; } },
      { getText: function() { return ''; } },
      { getText: function() { return 'Some transcript content...'; } },
      { getText: function() { return ''; } },
      { getText: function() { return '📧 EMAIL CORRESPONDENCE'; } },
      { getText: function() { return ''; } }
    ],
    getParagraphs: function() { return this.paragraphs; }
  };

  // Test 1: Find Call Transcripts section
  try {
    const index = findSectionIndex(mockBody, 'CALL TRANSCRIPTS');

    assertEqual(index, 2); // Index of paragraph with "📞 CALL TRANSCRIPTS"

    tests.push({ name: 'findSectionIndex finds Call Transcripts section', passed: true });
  } catch (e) {
    tests.push({ name: 'findSectionIndex finds Call Transcripts section', passed: false, error: e.message });
  }

  // Test 2: Find Email Correspondence section
  try {
    const index = findSectionIndex(mockBody, 'EMAIL CORRESPONDENCE');

    assertEqual(index, 6);

    tests.push({ name: 'findSectionIndex finds Email Correspondence section', passed: true });
  } catch (e) {
    tests.push({ name: 'findSectionIndex finds Email Correspondence section', passed: false, error: e.message });
  }

  // Test 3: Return -1 for non-existent section
  try {
    const index = findSectionIndex(mockBody, 'NONEXISTENT SECTION');

    assertEqual(index, -1);

    tests.push({ name: 'findSectionIndex returns -1 for missing section', passed: true });
  } catch (e) {
    tests.push({ name: 'findSectionIndex returns -1 for missing section', passed: false, error: e.message });
  }

  return tests;
}

function testAppendToSection() {
  const tests = [];

  // Mock document body
  const appendedContent = [];
  const mockBody = {
    paragraphs: [
      { getText: function() { return '📞 CALL TRANSCRIPTS'; } },
      { getText: function() { return ''; } },
      { getText: function() { return 'Existing content'; } }
    ],
    getParagraphs: function() { return this.paragraphs; },
    insertParagraph: function(index, text) {
      appendedContent.push({ index: index, text: text });
      return { setText: function() {} };
    }
  };

  // Test 1: Append content after section header
  try {
    appendToSection(mockBody, 'CALL TRANSCRIPTS', 'New transcript content');

    // Should insert after the section header (index 0) and empty line (index 1)
    assertEqual(appendedContent.length > 0, true);
    assertContains(appendedContent[0].text, 'New transcript content');

    tests.push({ name: 'appendToSection inserts content after section', passed: true });
  } catch (e) {
    tests.push({ name: 'appendToSection inserts content after section', passed: false, error: e.message });
  }

  // Test 2: Handle missing section gracefully
  try {
    const result = appendToSection(mockBody, 'MISSING SECTION', 'Content');

    // Should return false or handle gracefully
    assertEqual(result, false);

    tests.push({ name: 'appendToSection handles missing section', passed: true });
  } catch (e) {
    tests.push({ name: 'appendToSection handles missing section', passed: false, error: e.message });
  }

  return tests;
}

function testCreateDocumentStructure() {
  const tests = [];

  // Mock document
  const appendedText = [];
  const mockDoc = {
    getBody: function() {
      return {
        clear: function() {
          appendedText.length = 0; // Clear the array
        },
        insertParagraph: function(index, text) {
          appendedText.splice(index, 0, text);
          return {
            setText: function() {},
            editAsText: function() {
              return {
                setBold: function() {},
                setLinkUrl: function() {}
              };
            }
          };
        },
        appendParagraph: function(text) {
          appendedText.push(text);
          return {
            setText: function() {},
            setHeading: function() {},
            editAsText: function() {
              return {
                setBold: function() {},
                setFontSize: function() {}
              };
            }
          };
        }
      };
    }
  };

  // Test 1: Create all required sections
  try {
    createDocumentStructure(mockDoc, {
      opportunityName: 'Test Opportunity',
      salesforceUrl: 'https://example.com/opp/123'
    });

    // Should create header and all sections
    const allText = appendedText.join('\n');
    assertContains(allText, 'Test Opportunity');
    assertContains(allText, 'CALL TRANSCRIPTS');
    assertContains(allText, 'EMAIL CORRESPONDENCE');
    assertContains(allText, 'TECHNICAL REQUIREMENTS');
    assertContains(allText, 'TIMELINE & COMMITMENTS');

    tests.push({ name: 'createDocumentStructure creates all sections', passed: true });
  } catch (e) {
    tests.push({ name: 'createDocumentStructure creates all sections', passed: false, error: e.message });
  }

  // Test 2: Include Salesforce URL
  try {
    appendedText.length = 0; // Clear
    createDocumentStructure(mockDoc, {
      opportunityName: 'Acme Corp',
      salesforceUrl: 'https://salesforce.com/opp/456'
    });

    const allText = appendedText.join('\n');
    assertContains(allText, 'https://salesforce.com/opp/456');

    tests.push({ name: 'createDocumentStructure includes Salesforce URL', passed: true });
  } catch (e) {
    tests.push({ name: 'createDocumentStructure includes Salesforce URL', passed: false, error: e.message });
  }

  return tests;
}

function testAppendParagraphWithFormatting() {
  const tests = [];

  // Mock paragraph
  const mockParagraph = {
    text: '',
    bold: false,
    url: null,
    setText: function(text) { this.text = text; },
    getText: function() { return this.text; },
    editAsText: function() {
      const self = this;
      return {
        setBold: function(start, end, bold) { self.bold = bold; },
        setLinkUrl: function(start, end, url) { self.url = url; }
      };
    }
  };

  // Test 1: Set text content
  try {
    appendParagraphWithFormatting(mockParagraph, 'Test content');

    assertEqual(mockParagraph.getText(), 'Test content');

    tests.push({ name: 'appendParagraphWithFormatting sets text', passed: true });
  } catch (e) {
    tests.push({ name: 'appendParagraphWithFormatting sets text', passed: false, error: e.message });
  }

  // Test 2: Apply bold formatting
  try {
    mockParagraph.bold = false;
    appendParagraphWithFormatting(mockParagraph, 'Bold text', { bold: true });

    assertEqual(mockParagraph.bold, true);

    tests.push({ name: 'appendParagraphWithFormatting applies bold', passed: true });
  } catch (e) {
    tests.push({ name: 'appendParagraphWithFormatting applies bold', passed: false, error: e.message });
  }

  // Test 3: Set hyperlink URL
  try {
    mockParagraph.url = null;
    appendParagraphWithFormatting(mockParagraph, 'Link text', { url: 'https://example.com' });

    assertEqual(mockParagraph.url, 'https://example.com');

    tests.push({ name: 'appendParagraphWithFormatting sets link URL', passed: true });
  } catch (e) {
    tests.push({ name: 'appendParagraphWithFormatting sets link URL', passed: false, error: e.message });
  }

  return tests;
}

function testSetDocumentHeader() {
  const tests = [];

  // Mock document
  const mockDoc = {
    body: {
      paragraphs: [],
      insertParagraph: function(index, text) {
        const para = {
          text: text,
          bold: false,
          url: null,
          setText: function(t) { this.text = t; },
          getText: function() { return this.text; },
          editAsText: function() {
            const self = this;
            return {
              setBold: function(s, e, b) { self.bold = b; },
              setLinkUrl: function(s, e, u) { self.url = u; }
            };
          }
        };
        this.paragraphs.splice(index, 0, para);
        return para;
      },
      getParagraphs: function() { return this.paragraphs; }
    },
    getBody: function() { return this.body; }
  };

  // Test 1: Set header with opportunity name
  try {
    setDocumentHeader(mockDoc, {
      opportunityName: 'Test Opportunity',
      salesforceUrl: 'https://example.com'
    });

    const headerText = mockDoc.body.paragraphs.map(p => p.getText()).join('\n');
    assertContains(headerText, 'Test Opportunity');

    tests.push({ name: 'setDocumentHeader includes opportunity name', passed: true });
  } catch (e) {
    tests.push({ name: 'setDocumentHeader includes opportunity name', passed: false, error: e.message });
  }

  // Test 2: Include Salesforce link
  try {
    mockDoc.body.paragraphs = [];
    setDocumentHeader(mockDoc, {
      opportunityName: 'Acme',
      salesforceUrl: 'https://salesforce.com/123'
    });

    const headerText = mockDoc.body.paragraphs.map(p => p.getText()).join('\n');
    assertContains(headerText, 'Salesforce');
    assertContains(headerText, 'https://salesforce.com/123');

    tests.push({ name: 'setDocumentHeader includes Salesforce URL', passed: true });
  } catch (e) {
    tests.push({ name: 'setDocumentHeader includes Salesforce URL', passed: false, error: e.message });
  }

  return tests;
}
