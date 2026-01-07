import { createClient } from '@libsql/client/web';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const tursoUrl = process.env.TURSO_DATABASE_URL!;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN!;

async function runSetup() {
  console.log('🚀 Attempting to setup Turso database...\n');
  
  const client = createClient({
    url: tursoUrl,
    authToken: tursoAuthToken,
  });

  try {
    // Read the complete setup SQL
    const sqlFile = fs.readFileSync('database/turso-complete-setup.sql', 'utf-8');
    
    // Split into individual statements
    const statements = sqlFile
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SELECT'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 60).replace(/\n/g, ' ');
      
      try {
        await client.execute(statement);
        successCount++;
        console.log(`✅ ${i + 1}/${statements.length}: ${preview}...`);
      } catch (error: any) {
        errorCount++;
        if (error.message.includes('BLOCKED') || error.message.includes('forbidden')) {
          console.log(`❌ ${i + 1}/${statements.length}: BLOCKED - Token has read-only access`);
          console.log(`\n⚠️  ERROR: The current Turso token has READ-ONLY permission!`);
          console.log(`\nYou need to:`);
          console.log(`1. Go to https://turso.tech/app`);
          console.log(`2. Open your database: dostar`);
          console.log(`3. Run the SQL from: database/turso-complete-setup.sql`);
          console.log(`\nOr generate a new token with write permissions.`);
          process.exit(1);
        } else if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`⚠️  ${i + 1}/${statements.length}: Already exists (skipping)`);
        } else {
          console.log(`❌ ${i + 1}/${statements.length}: ${error.message}`);
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    if (successCount > 0) {
      console.log(`\n✅ Setup completed!`);
      console.log(`\n📋 Verifying tables...`);
      
      const tables = await client.execute(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name;
      `);

      console.log(`\nFound ${tables.rows.length} tables:`);
      tables.rows.forEach((row: any) => {
        console.log(`  - ${row.name}`);
      });

      if (tables.rows.length >= 6) {
        console.log(`\n🎉 Database setup successful!`);
        console.log(`\nNext steps:`);
        console.log(`1. Set DEMO_MODE=false in .env.local`);
        console.log(`2. Restart the server: npm run dev`);
        console.log(`3. Test login: node test-login-http.js`);
      }
    }

  } catch (error: any) {
    console.error(`\n❌ Setup failed:`, error.message);
    
    if (error.message.includes('BLOCKED') || error.message.includes('forbidden')) {
      console.log(`\n⚠️  The current token has READ-ONLY access.`);
      console.log(`\nPlease run the SQL manually:`);
      console.log(`1. Go to: https://turso.tech/app`);
      console.log(`2. Open database: dostar`);
      console.log(`3. Open SQL Console`);
      console.log(`4. Copy and run: database/turso-complete-setup.sql`);
    }
    
    process.exit(1);
  }
}

runSetup();
