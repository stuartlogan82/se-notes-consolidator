/**
 * Tests for Orchestrator.js
 * Following TDD: Write tests first, then implement
 */

/**
 * Test processOpportunities main function
 * This function coordinates the entire workflow:
 * 1. Read configs from sheet
 * 2. Iterate through opportunities
 * 3. Fetch new content since last sync
 * 4. Format and append to docs
 * 5. Update sync dates
 * 6. Handle errors per opportunity
 */
function testProcessOpportunities() {
  const tests = [];

  // Track what was called for verification
  const mockCalls = {
    getOpportunityConfigs: 0,
    fetchFirefliesTranscripts: [],
    fetchGmailThreads: [],
    getOrCreateDocument: [],
    createDocumentStructure: [],
    appendTranscript: [],
    appendEmailThread: [],
    updateLastSyncDate: [],
    updateOpportunityStatus: []
  };

  // Mock SpreadsheetApp
  const mockSpreadsheetApp = {
    getActiveSpreadsheet: function() {
      return {
        getSheetByName: function(name) {
          return {
            getName: function() { return name; },
            getLastRow: function() { return 3; },
            getRange: function(row, col, numRows, numCols) {
              return {
                getValues: function() {
                  return [
                    ['Acme Corp', 'https://salesforce.com/123', 'channel-acme-123', 'sales', 'doc-123', '2025-01-10 08:00:00', 'Success', ''],
                    ['TechCo', 'https://salesforce.com/456', 'channel-techco-456', 'trial', 'doc-456', '2025-01-09 08:00:00', 'Success', '']
                  ];
                },
                setValue: function(value) {
                  // Mock implementation - just track the call
                  this.value = value;
                }
              };
            }
          };
        }
      };
    }
  };

  // Mock API functions
  const mockFirefliesAPI = {
    fetchFirefliesTranscripts: function(options) {
      mockCalls.fetchFirefliesTranscripts.push({ channel_id: options.channel_id, sinceDate: options.sinceDate });

      // Return mock transcripts based on channel
      if (options.channel_id === 'channel-acme-123') {
        return [
          {
            id: 'trans-1',
            title: 'Acme Discovery Call',
            date: '2025-01-12',
            durationMinutes: 30,
            participants: ['john@acme.com'],
            formattedTranscript: 'John: We need help with integration.'
          }
        ];
      }
      return [];
    }
  };

  const mockGmailAPI = {
    fetchGmailThreads: function(options) {
      mockCalls.fetchGmailThreads.push({ afterDate: options.afterDate, label: options.label });

      // Return mock email threads based on label
      if (options.label === 'sales') {
        return [
          {
            id: 'thread-1',
            subject: 'Integration Questions',
            messageCount: 2,
            messages: [
              {
                from: 'john@acme.com',
                subject: 'Integration Questions',
                dateFormatted: '2025-01-11 10:00:00',
                body: 'Can you help us integrate?'
              }
            ]
          }
        ];
      }
      return [];
    }
  };

  const mockDocsAPI = {
    getOrCreateDocument: function(docId, docName) {
      mockCalls.getOrCreateDocument.push({ docId: docId, docName: docName });
      return {
        getId: function() { return docId; },
        getBody: function() {
          return {
            getParagraphs: function() { return []; }
          };
        }
      };
    },
    createDocumentStructure: function(doc, config) {
      mockCalls.createDocumentStructure.push(config.opportunityName);
    },
    appendTranscript: function(doc, transcript) {
      mockCalls.appendTranscript.push(transcript.id);
    },
    appendEmailThread: function(doc, thread) {
      mockCalls.appendEmailThread.push(thread.id);
    }
  };

  const mockSheetConfig = {
    updateLastSyncDate: function(sheet, config, date) {
      mockCalls.updateLastSyncDate.push(config.opportunityName);
    },
    updateOpportunityStatus: function(sheet, config, status) {
      mockCalls.updateOpportunityStatus.push({ opportunity: config.opportunityName, status: status });
    }
  };

  // Test 1: Process all opportunities successfully
  try {
    const result = processOpportunitiesHelper(
      mockSpreadsheetApp,
      mockFirefliesAPI,
      mockGmailAPI,
      mockDocsAPI,
      mockSheetConfig
    );

    // Should process both opportunities
    assertEqual(result.processed, 2);
    assertEqual(result.successful, 2);
    assertEqual(result.failed, 0);

    // Should fetch transcripts for both opportunities
    assertEqual(mockCalls.fetchFirefliesTranscripts.length, 2);
    assertEqual(mockCalls.fetchFirefliesTranscripts[0].channel_id, 'channel-acme-123');
    assertEqual(mockCalls.fetchFirefliesTranscripts[1].channel_id, 'channel-techco-456');

    // Should fetch emails for both opportunities
    assertEqual(mockCalls.fetchGmailThreads.length, 2);

    // Should get/create documents
    assertEqual(mockCalls.getOrCreateDocument.length, 2);

    // Should append Acme transcript
    assertEqual(mockCalls.appendTranscript.length, 1);
    assertEqual(mockCalls.appendTranscript[0], 'trans-1');

    // Should append Acme email thread
    assertEqual(mockCalls.appendEmailThread.length, 1);
    assertEqual(mockCalls.appendEmailThread[0], 'thread-1');

    // Should update sync dates
    assertEqual(mockCalls.updateLastSyncDate.length, 2);

    tests.push({ name: 'processOpportunities handles all opportunities', passed: true });
  } catch (e) {
    tests.push({ name: 'processOpportunities handles all opportunities', passed: false, error: e.message });
  }

  return tests;
}

/**
 * Test error isolation - one opportunity failure shouldn't stop others
 */
function testProcessOpportunitiesErrorIsolation() {
  const tests = [];

  const mockCalls = {
    processed: [],
    failed: []
  };

  // Mock that throws error on first opportunity
  const mockSpreadsheetApp = {
    getActiveSpreadsheet: function() {
      return {
        getSheetByName: function(name) {
          return {
            getName: function() { return name; },
            getLastRow: function() { return 3; },
            getRange: function(row, col, numRows, numCols) {
              return {
                getValues: function() {
                  return [
                    ['Bad Opp', 'https://salesforce.com/bad', 'channel-bad-999', 'sales', 'invalid-doc', '2025-01-10 08:00:00', 'Success', ''],
                    ['Good Opp', 'https://salesforce.com/good', 'channel-good-777', 'trial', 'doc-456', '2025-01-09 08:00:00', 'Success', '']
                  ];
                },
                setValue: function(value) {
                  this.value = value;
                }
              };
            }
          };
        }
      };
    }
  };

  const mockFirefliesAPI = {
    fetchFirefliesTranscripts: function(options) {
      if (options.channel_id === 'channel-bad-999') {
        throw new Error('API Error: Invalid channel');
      }
      return [];
    }
  };

  const mockGmailAPI = {
    fetchGmailThreads: function(options) { return []; }
  };

  const mockDocsAPI = {
    getOrCreateDocument: function(docId) {
      if (docId === 'invalid-doc') {
        throw new Error('Document not found');
      }
      return {
        getId: function() { return docId; },
        getBody: function() {
          return {
            getParagraphs: function() { return []; }
          };
        }
      };
    },
    createDocumentStructure: function() {},
    appendTranscript: function() {},
    appendEmailThread: function() {}
  };

  const mockSheetConfig = {
    updateLastSyncDate: function(sheet, config) {
      mockCalls.processed.push(config.opportunityName);
    },
    updateOpportunityStatus: function(sheet, config, status) {
      if (status === 'Error') {
        mockCalls.failed.push(config.opportunityName);
      }
    }
  };

  // Test: First opportunity fails, second succeeds
  try {
    const result = processOpportunitiesHelper(
      mockSpreadsheetApp,
      mockFirefliesAPI,
      mockGmailAPI,
      mockDocsAPI,
      mockSheetConfig
    );

    // Should attempt both opportunities
    assertEqual(result.processed, 2);
    assertEqual(result.successful, 1);
    assertEqual(result.failed, 1);

    // Should mark first as failed
    assertEqual(mockCalls.failed.length, 1);
    assertEqual(mockCalls.failed[0], 'Bad Opp');

    // Should still process second successfully
    assertEqual(mockCalls.processed.length, 1);
    assertEqual(mockCalls.processed[0], 'Good Opp');

    tests.push({ name: 'processOpportunities isolates errors per opportunity', passed: true });
  } catch (e) {
    tests.push({ name: 'processOpportunities isolates errors per opportunity', passed: false, error: e.message });
  }

  return tests;
}

/**
 * Test error isolation within a single opportunity
 * When Fireflies API fails, Gmail should still be fetched
 */
function testProcessOpportunityAPIErrorIsolation() {
  const tests = [];

  const mockCalls = {
    fetchFireflies: 0,
    fetchGmail: 0,
    appendEmailThread: 0,
    updateLastSyncDate: 0,
    updateOpportunityStatus: []
  };

  const mockSpreadsheetApp = {
    getActiveSpreadsheet: function() {
      return {
        getSheetByName: function(name) {
          return {
            getName: function() { return name; },
            getLastRow: function() { return 2; },
            getRange: function(row, col, numRows, numCols) {
              return {
                getValues: function() {
                  return [
                    ['Acme Corp', 'https://salesforce.com/123', 'channel-acme-123', 'sales', 'doc-123', '2025-01-10 08:00:00', 'Success', '']
                  ];
                },
                setValue: function(value) {
                  this.value = value;
                }
              };
            }
          };
        }
      };
    }
  };

  // Fireflies API throws error, but Gmail should still work
  const mockFirefliesAPI = {
    fetchFirefliesTranscripts: function(options) {
      mockCalls.fetchFireflies++;
      throw new Error('Fireflies API rate limit exceeded');
    }
  };

  const mockGmailAPI = {
    fetchGmailThreads: function(options) {
      mockCalls.fetchGmail++;
      // Gmail returns valid data
      return [
        {
          id: 'thread-1',
          subject: 'Integration Questions',
          messageCount: 2,
          messages: [
            {
              from: 'john@acme.com',
              subject: 'Integration Questions',
              dateFormatted: '2025-01-11 10:00:00',
              body: 'Can you help us integrate?'
            }
          ]
        }
      ];
    }
  };

  const mockDocsAPI = {
    getOrCreateDocument: function(docId) {
      return {
        getId: function() { return docId; },
        getBody: function() {
          return {
            getParagraphs: function() {
              // Return a paragraph that contains "CALL TRANSCRIPTS" to simulate existing structure
              return [{
                getText: function() { return '📞 CALL TRANSCRIPTS'; }
              }];
            }
          };
        }
      };
    },
    createDocumentStructure: function() {},
    appendTranscript: function() {},
    appendEmailThread: function(doc, thread) {
      mockCalls.appendEmailThread++;
    }
  };

  const mockSheetConfig = {
    updateLastSyncDate: function(sheet, config, date) {
      mockCalls.updateLastSyncDate++;
    },
    updateOpportunityStatus: function(sheet, config, status) {
      mockCalls.updateOpportunityStatus.push(status);
    },
    updateDocId: function() {}
  };

  // Test: Fireflies fails but Gmail should still be fetched and appended
  try {
    const result = processOpportunitiesHelper(
      mockSpreadsheetApp,
      mockFirefliesAPI,
      mockGmailAPI,
      mockDocsAPI,
      mockSheetConfig
    );

    // Fireflies API should have been called and failed
    assertEqual(mockCalls.fetchFireflies, 1, 'Fireflies API should have been called');

    // Gmail API should still have been called despite Fireflies failure
    assertEqual(mockCalls.fetchGmail, 1, 'Gmail API should have been called despite Fireflies failure');

    // Email should have been appended
    assertEqual(mockCalls.appendEmailThread, 1, 'Email thread should have been appended');

    // Should still update last sync date and status to success
    assertEqual(mockCalls.updateLastSyncDate, 1, 'Should update last sync date');
    assertTrue(mockCalls.updateOpportunityStatus.includes('Success'), 'Should mark opportunity as Success');

    // Overall result should show success despite partial failure
    assertEqual(result.successful, 1, 'Should mark opportunity as successful');
    assertEqual(result.failed, 0, 'Should not mark opportunity as failed');

    tests.push({ name: 'processOpportunity continues to fetch Gmail when Fireflies fails', passed: true });
  } catch (e) {
    tests.push({ name: 'processOpportunity continues to fetch Gmail when Fireflies fails', passed: false, error: e.message });
  }

  return tests;
}

/**
 * Test error isolation within a single opportunity (reverse scenario)
 * When Gmail API fails, Fireflies should still be fetched
 */
function testProcessOpportunityGmailErrorIsolation() {
  const tests = [];

  const mockCalls = {
    fetchFireflies: 0,
    fetchGmail: 0,
    appendTranscript: 0,
    updateLastSyncDate: 0,
    updateOpportunityStatus: []
  };

  const mockSpreadsheetApp = {
    getActiveSpreadsheet: function() {
      return {
        getSheetByName: function(name) {
          return {
            getName: function() { return name; },
            getLastRow: function() { return 2; },
            getRange: function(row, col, numRows, numCols) {
              return {
                getValues: function() {
                  return [
                    ['Acme Corp', 'https://salesforce.com/123', 'channel-acme-123', 'sales', 'doc-123', '2025-01-10 08:00:00', 'Success', '']
                  ];
                },
                setValue: function(value) {
                  this.value = value;
                }
              };
            }
          };
        }
      };
    }
  };

  // Fireflies API works
  const mockFirefliesAPI = {
    fetchFirefliesTranscripts: function(options) {
      mockCalls.fetchFireflies++;
      return [
        {
          id: 'trans-1',
          title: 'Acme Discovery Call',
          date: '2025-01-12',
          durationMinutes: 30,
          participants: ['john@acme.com'],
          formattedTranscript: 'John: We need help with integration.'
        }
      ];
    }
  };

  // Gmail API throws error
  const mockGmailAPI = {
    fetchGmailThreads: function(options) {
      mockCalls.fetchGmail++;
      throw new Error('Gmail API quota exceeded');
    }
  };

  const mockDocsAPI = {
    getOrCreateDocument: function(docId) {
      return {
        getId: function() { return docId; },
        getBody: function() {
          return {
            getParagraphs: function() {
              return [{
                getText: function() { return '📞 CALL TRANSCRIPTS'; }
              }];
            }
          };
        }
      };
    },
    createDocumentStructure: function() {},
    appendTranscript: function(doc, transcript) {
      mockCalls.appendTranscript++;
    },
    appendEmailThread: function() {}
  };

  const mockSheetConfig = {
    updateLastSyncDate: function(sheet, config, date) {
      mockCalls.updateLastSyncDate++;
    },
    updateOpportunityStatus: function(sheet, config, status) {
      mockCalls.updateOpportunityStatus.push(status);
    },
    updateDocId: function() {}
  };

  // Test: Gmail fails but Fireflies should still be fetched and appended
  try {
    const result = processOpportunitiesHelper(
      mockSpreadsheetApp,
      mockFirefliesAPI,
      mockGmailAPI,
      mockDocsAPI,
      mockSheetConfig
    );

    // Fireflies API should have been called successfully
    assertEqual(mockCalls.fetchFireflies, 1, 'Fireflies API should have been called');

    // Gmail API should have been called and failed
    assertEqual(mockCalls.fetchGmail, 1, 'Gmail API should have been called');

    // Transcript should have been appended despite Gmail failure
    assertEqual(mockCalls.appendTranscript, 1, 'Transcript should have been appended');

    // Should still update last sync date and status to success
    assertEqual(mockCalls.updateLastSyncDate, 1, 'Should update last sync date');
    assertTrue(mockCalls.updateOpportunityStatus.includes('Success'), 'Should mark opportunity as Success');

    // Overall result should show success despite partial failure
    assertEqual(result.successful, 1, 'Should mark opportunity as successful');
    assertEqual(result.failed, 0, 'Should not mark opportunity as failed');

    tests.push({ name: 'processOpportunity continues to fetch Fireflies when Gmail fails', passed: true });
  } catch (e) {
    tests.push({ name: 'processOpportunity continues to fetch Fireflies when Gmail fails', passed: false, error: e.message });
  }

  return tests;
}

/**
 * Test handling empty results (no new transcripts or emails)
 */
function testProcessOpportunitiesEmptyResults() {
  const tests = [];

  const mockCalls = {
    updateLastSyncDate: 0,
    appendTranscript: 0,
    appendEmailThread: 0
  };

  const mockSpreadsheetApp = {
    getActiveSpreadsheet: function() {
      return {
        getSheetByName: function(name) {
          return {
            getName: function() { return name; },
            getLastRow: function() { return 2; },
            getRange: function(row, col, numRows, numCols) {
              return {
                getValues: function() {
                  return [
                    ['Acme Corp', 'https://salesforce.com/123', 'acme.com', 'sales', 'doc-123', '2025-01-10 08:00:00', 'Success', '']
                  ];
                },
                setValue: function(value) {
                  this.value = value;
                }
              };
            }
          };
        }
      };
    }
  };

  const mockFirefliesAPI = {
    fetchFirefliesTranscripts: function() { return []; }  // No new transcripts
  };

  const mockGmailAPI = {
    fetchGmailThreads: function() { return []; }  // No new emails
  };

  const mockDocsAPI = {
    getOrCreateDocument: function(docId) {
      return {
        getId: function() { return docId; },
        getBody: function() {
          return {
            getParagraphs: function() { return []; }
          };
        }
      };
    },
    createDocumentStructure: function() {},
    appendTranscript: function() {
      mockCalls.appendTranscript++;
    },
    appendEmailThread: function() {
      mockCalls.appendEmailThread++;
    }
  };

  const mockSheetConfig = {
    updateLastSyncDate: function() {
      mockCalls.updateLastSyncDate++;
    },
    updateOpportunityStatus: function() {}
  };

  // Test: No new content, but still update sync date
  try {
    const result = processOpportunitiesHelper(
      mockSpreadsheetApp,
      mockFirefliesAPI,
      mockGmailAPI,
      mockDocsAPI,
      mockSheetConfig
    );

    // Should process opportunity even with no new content
    assertEqual(result.processed, 1);
    assertEqual(result.successful, 1);

    // Should not append anything
    assertEqual(mockCalls.appendTranscript, 0);
    assertEqual(mockCalls.appendEmailThread, 0);

    // Should still update sync date
    assertEqual(mockCalls.updateLastSyncDate, 1);

    tests.push({ name: 'processOpportunities handles empty results gracefully', passed: true });
  } catch (e) {
    tests.push({ name: 'processOpportunities handles empty results gracefully', passed: false, error: e.message });
  }

  return tests;
}

/**
 * Test document structure creation for new docs
 */
function testProcessOpportunitiesNewDocument() {
  const tests = [];

  const mockCalls = {
    createDocumentStructure: 0
  };

  const mockSpreadsheetApp = {
    getActiveSpreadsheet: function() {
      return {
        getSheetByName: function(name) {
          return {
            getName: function() { return name; },
            getLastRow: function() { return 2; },
            getRange: function(row, col, numRows, numCols) {
              return {
                getValues: function() {
                  return [
                    ['New Opp', 'https://salesforce.com/new', 'channel-new-111', 'sales', '', '2025-01-10 08:00:00', 'Success', '']  // Empty doc ID
                  ];
                },
                setValue: function(value) {
                  this.value = value;
                }
              };
            }
          };
        }
      };
    }
  };

  const mockFirefliesAPI = {
    fetchFirefliesTranscripts: function() { return []; }
  };

  const mockGmailAPI = {
    fetchGmailThreads: function(options) { return []; }
  };

  const mockDocsAPI = {
    getOrCreateDocument: function(docId, docName) {
      // Returns new doc (docId was empty)
      return {
        getId: function() { return 'newly-created-doc-id'; },
        getBody: function() {
          return {
            getParagraphs: function() { return []; }  // Empty doc
          };
        }
      };
    },
    createDocumentStructure: function(doc, config) {
      mockCalls.createDocumentStructure++;
    },
    appendTranscript: function() {},
    appendEmailThread: function() {}
  };

  const mockSheetConfig = {
    updateLastSyncDate: function() {},
    updateOpportunityStatus: function() {},
    updateDocId: function() {}
  };

  // Test: New document should have structure created
  try {
    const result = processOpportunitiesHelper(
      mockSpreadsheetApp,
      mockFirefliesAPI,
      mockGmailAPI,
      mockDocsAPI,
      mockSheetConfig
    );

    // Should create document structure for new doc
    assertEqual(mockCalls.createDocumentStructure, 1);

    tests.push({ name: 'processOpportunities creates structure for new docs', passed: true });
  } catch (e) {
    tests.push({ name: 'processOpportunities creates structure for new docs', passed: false, error: e.message });
  }

  return tests;
}
