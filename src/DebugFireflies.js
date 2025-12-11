/**
 * Debug functions for Fireflies API
 * These help troubleshoot API queries and responses
 */

/**
 * Debug function to see the raw GraphQL query and response
 */
function debugFirefliesQuery() {
  Logger.log('=== Debugging Fireflies Query ===\n');

  const apiKey = PropertiesService.getScriptProperties().getProperty('FIREFLIES_API_KEY');

  // Test 1: Simple query with no filters
  Logger.log('TEST 1: Query with no filters (should return recent transcripts)');
  const query1 = buildFirefliesGraphQLQuery({});
  Logger.log('Query:');
  Logger.log(query1);

  try {
    const response1 = UrlFetchApp.fetch('https://api.fireflies.ai/graphql', {
      method: 'post',
      contentType: 'application/json',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      payload: JSON.stringify({ query: query1 }),
      muteHttpExceptions: true
    });

    Logger.log('\nResponse Code: ' + response1.getResponseCode());
    Logger.log('Response Body:');
    Logger.log(response1.getContentText());

    const json1 = JSON.parse(response1.getContentText());
    if (json1.data && json1.data.transcripts) {
      Logger.log(`\n✓ Found ${json1.data.transcripts.length} transcripts`);
    }
    if (json1.errors) {
      Logger.log('\n✗ GraphQL Errors:');
      json1.errors.forEach(err => Logger.log('  - ' + err.message));
    }
  } catch (e) {
    Logger.log('\n✗ Error: ' + e.message);
  }

  // Test 2: Query with limit only
  Logger.log('\n\nTEST 2: Query with limit=5');
  const query2 = buildFirefliesGraphQLQuery({ limit: 5 });
  Logger.log('Query:');
  Logger.log(query2);

  try {
    const response2 = UrlFetchApp.fetch('https://api.fireflies.ai/graphql', {
      method: 'post',
      contentType: 'application/json',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      payload: JSON.stringify({ query: query2 }),
      muteHttpExceptions: true
    });

    Logger.log('\nResponse Code: ' + response2.getResponseCode());
    const json2 = JSON.parse(response2.getContentText());

    if (json2.data && json2.data.transcripts) {
      Logger.log(`✓ Found ${json2.data.transcripts.length} transcripts`);
      if (json2.data.transcripts.length > 0) {
        Logger.log('\nFirst transcript:');
        Logger.log(JSON.stringify(json2.data.transcripts[0], null, 2));
      }
    }
    if (json2.errors) {
      Logger.log('\n✗ GraphQL Errors:');
      json2.errors.forEach(err => Logger.log('  - ' + err.message));
    }
  } catch (e) {
    Logger.log('\n✗ Error: ' + e.message);
  }
}

/**
 * Test a minimal GraphQL query to see if transcripts query exists
 */
function testMinimalQuery() {
  Logger.log('=== Testing Minimal GraphQL Query ===\n');

  const apiKey = PropertiesService.getScriptProperties().getProperty('FIREFLIES_API_KEY');

  // Simplest possible query
  const minimalQuery = `
    query {
      transcripts {
        id
        title
      }
    }
  `;

  Logger.log('Minimal Query:');
  Logger.log(minimalQuery);

  try {
    const response = UrlFetchApp.fetch('https://api.fireflies.ai/graphql', {
      method: 'post',
      contentType: 'application/json',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      payload: JSON.stringify({ query: minimalQuery }),
      muteHttpExceptions: true
    });

    Logger.log('\nResponse Code: ' + response.getResponseCode());
    Logger.log('Response:');
    Logger.log(response.getContentText());

    const json = JSON.parse(response.getContentText());
    if (json.data && json.data.transcripts) {
      Logger.log(`\n✓ Success! Found ${json.data.transcripts.length} transcripts`);
      if (json.data.transcripts.length > 0) {
        Logger.log('\nFirst 3 transcripts:');
        json.data.transcripts.slice(0, 3).forEach(t => {
          Logger.log(`  - ${t.id}: ${t.title}`);
        });
      }
    }
    if (json.errors) {
      Logger.log('\n✗ GraphQL Errors:');
      json.errors.forEach(err => {
        Logger.log('  - ' + err.message);
        if (err.extensions) {
          Logger.log('    Extensions: ' + JSON.stringify(err.extensions));
        }
      });
    }
  } catch (e) {
    Logger.log('\n✗ Error: ' + e.message);
    Logger.log('Stack: ' + e.stack);
  }
}

/**
 * Check the GraphQL schema to see available queries
 */
function introspectFirefliesSchema() {
  Logger.log('=== Introspecting Fireflies GraphQL Schema ===\n');

  const apiKey = PropertiesService.getScriptProperties().getProperty('FIREFLIES_API_KEY');

  // GraphQL introspection query
  const introspectionQuery = `
    query {
      __schema {
        queryType {
          fields {
            name
            description
            args {
              name
              type {
                name
                kind
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = UrlFetchApp.fetch('https://api.fireflies.ai/graphql', {
      method: 'post',
      contentType: 'application/json',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      payload: JSON.stringify({ query: introspectionQuery }),
      muteHttpExceptions: true
    });

    const json = JSON.parse(response.getContentText());

    if (json.data && json.data.__schema) {
      Logger.log('Available queries:');
      const fields = json.data.__schema.queryType.fields;
      fields.forEach(field => {
        Logger.log(`\n${field.name}:`);
        if (field.description) Logger.log(`  Description: ${field.description}`);
        if (field.args && field.args.length > 0) {
          Logger.log('  Arguments:');
          field.args.forEach(arg => {
            Logger.log(`    - ${arg.name}: ${arg.type.name || arg.type.kind}`);
          });
        }
      });
    } else {
      Logger.log('Could not introspect schema');
      Logger.log(response.getContentText());
    }
  } catch (e) {
    Logger.log('✗ Error: ' + e.message);
  }
}
