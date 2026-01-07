import { createClient } from '@libsql/client/web';

const tursoUrl = 'libsql://dostar-dostar.aws-ap-northeast-1.turso.io';
const tursoAuthToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicm8iLCJpYXQiOjE3Njc3NjQ5ODMsImlkIjoiYTU1OTcwMzctMzQ1Zi00ODQ2LTgyMTYtNWJkNzEyYmRkMmRlIiwicmlkIjoiMDMxOTcwYzYtMzllNS00MzYyLWIwMDItM2M4OGYzNDNjOGZkIn0.Oi51SAhSaUc_JGxiiLwvzepjPFqfvgMNMhm_FErteYPsnBCCfgmoirZ6a7knLPNcuQ3RsqxzExnn-p-r2YgkCQ';

async function testToken() {
  console.log('Testing new token...\n');
  
  const client = createClient({
    url: tursoUrl,
    authToken: tursoAuthToken,
  });

  try {
    // Test 1: Read access
    console.log('Test 1: Checking read access...');
    const tables = await client.execute(`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
    `);
    console.log(`✅ Read access works! Found ${tables.rows.length} tables\n`);

    // Test 2: Write access
    console.log('Test 2: Checking write access...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS test_table (id TEXT PRIMARY KEY, name TEXT);
    `);
    console.log('✅ Write access works! Can create tables\n');

    // Clean up test table
    await client.execute(`DROP TABLE IF EXISTS test_table;`);
    console.log('✅ Token has FULL access (read + write)!\n');
    
    return true;
  } catch (error: any) {
    if (error.message.includes('BLOCKED') || error.message.includes('forbidden')) {
      console.log('❌ Token still has READ-ONLY access\n');
      console.log('The token payload shows "a":"ro" which means read-only.\n');
      console.log('You need to generate a token with write permissions.');
      console.log('\nIn Turso Dashboard:');
      console.log('1. Go to your database settings');
      console.log('2. Look for "Create Token" or "Generate Token"');
      console.log('3. Make sure to select "Read & Write" permissions');
      console.log('4. NOT "Read Only"\n');
      return false;
    }
    throw error;
  }
}

testToken();
