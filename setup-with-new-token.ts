import { createClient } from '@libsql/client/web';
import * as fs from 'fs';

const tursoUrl = 'libsql://dostar-dostar.aws-ap-northeast-1.turso.io';
const tursoAuthToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3NjUzMDksImlkIjoiYTU1OTcwMzctMzQ1Zi00ODQ2LTgyMTYtNWJkNzEyYmRkMmRlIiwicmlkIjoiMDMxOTcwYzYtMzllNS00MzYyLWIwMDItM2M4OGYzNDNjOGZkIn0.JuHL0gDgcdH0Yg1euuPpFBURYGc8Q2i5FvnAJdGtYcy41ErdYtbkRkMGrxbGLtUWMTWklX8Fee6uLRXOhmmjDQ';

async function setupDatabase() {
  console.log('🚀 Setting up Turso database with WRITE token...\n');
  
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
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 50).replace(/\n/g, ' ');
      
      try {
        await client.execute(statement);
        successCount++;
        console.log(`✅ ${i + 1}/${statements.length}: ${preview}...`);
      } catch (error: any) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          successCount++;
          console.log(`⚠️  ${i + 1}/${statements.length}: Already exists (OK)`);
        } else {
          errorCount++;
          console.log(`❌ ${i + 1}/${statements.length}: ${error.message}`);
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}\n`);

    // Verify tables
    console.log('📋 Verifying tables...');
    const tables = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name;
    `);

    console.log(`\nFound ${tables.rows.length} tables:`);
    tables.rows.forEach((row: any) => {
      console.log(`  ✅ ${row.name}`);
    });

    // Verify users
    console.log(`\n👥 Verifying users...`);
    const users = await client.execute(`SELECT email, role FROM users;`);
    console.log(`\nFound ${users.rows.length} users:`);
    users.rows.forEach((row: any) => {
      console.log(`  ✅ ${row.email} (${row.role})`);
    });

    // Verify products
    console.log(`\n📦 Verifying products...`);
    const products = await client.execute(`SELECT name, price FROM products;`);
    console.log(`\nFound ${products.rows.length} products:`);
    products.rows.forEach((row: any) => {
      console.log(`  ✅ ${row.name} - ${row.price} kr`);
    });

    console.log(`\n🎉 Database setup completed successfully!\n`);
    console.log(`Next steps:`);
    console.log(`1. Update .env.local with the new token`);
    console.log(`2. Set DEMO_MODE=false`);
    console.log(`3. Restart server: npm run dev`);
    console.log(`4. Test login: node test-login-http.js\n`);

  } catch (error: any) {
    console.error(`\n❌ Setup failed:`, error.message);
    process.exit(1);
  }
}

setupDatabase();
