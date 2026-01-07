import { createClient } from '@libsql/client/web';
import * as fs from 'fs';

const tursoUrl = 'libsql://dostar-dostar.aws-ap-northeast-1.turso.io';
const tursoAuthToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3NjUzMDksImlkIjoiYTU1OTcwMzctMzQ1Zi00ODQ2LTgyMTYtNWJkNzEyYmRkMmRlIiwicmlkIjoiMDMxOTcwYzYtMzllNS00MzYyLWIwMDItM2M4OGYzNDNjOGZkIn0.JuHL0gDgcdH0Yg1euuPpFBURYGc8Q2i5FvnAJdGtYcy41ErdYtbkRkMGrxbGLtUWMTWklX8Fee6uLRXOhmmjDQ';

async function setupDatabase() {
  console.log('🚀 Setting up Turso database...\n');
  
  const client = createClient({
    url: tursoUrl,
    authToken: tursoAuthToken,
  });

  try {
    // Read SQL file
    let sqlFile = fs.readFileSync('database/turso-complete-setup.sql', 'utf-8');
    
    // Remove comments
    sqlFile = sqlFile.replace(/--[^\n]*\n/g, '\n');
    
    // Split by semicolon and filter
    const statements = sqlFile
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 10); // Filter out empty or very short statements

    console.log(`📝 Found ${statements.length} SQL statements\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip SELECT statements (they're just for verification in the file)
      if (statement.toUpperCase().startsWith('SELECT')) {
        skipCount++;
        continue;
      }
      
      const preview = statement.substring(0, 60).replace(/\s+/g, ' ');
      
      try {
        await client.execute(statement);
        successCount++;
        console.log(`✅ ${successCount}. ${preview}...`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          successCount++;
          console.log(`⚠️  ${successCount}. Already exists: ${preview}...`);
        } else {
          errorCount++;
          console.log(`❌ Error: ${preview}...`);
          console.log(`   ${error.message}\n`);
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}\n`);

    if (errorCount > 0) {
      console.log('⚠️  Some statements failed, but continuing...\n');
    }

    // Verify setup
    console.log('📋 Verifying database setup...\n');
    
    const tables = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name;
    `);

    console.log(`Tables (${tables.rows.length}):`);
    tables.rows.forEach((row: any) => {
      console.log(`  ✅ ${row.name}`);
    });

    if (tables.rows.length >= 6) {
      console.log(`\n👥 Checking users...`);
      const users = await client.execute(`SELECT email, role FROM users;`);
      console.log(`Users (${users.rows.length}):`);
      users.rows.forEach((row: any) => {
        console.log(`  ✅ ${row.email} (${row.role})`);
      });

      console.log(`\n📦 Checking products...`);
      const products = await client.execute(`SELECT name, price FROM products LIMIT 5;`);
      console.log(`Products (${products.rows.length}):`);
      products.rows.forEach((row: any) => {
        console.log(`  ✅ ${row.name} - ${row.price} kr`);
      });

      console.log(`\n🎉 Database setup completed successfully!\n`);
      console.log(`✅ All tables created`);
      console.log(`✅ Test users added`);
      console.log(`✅ Sample products added\n`);
    } else {
      console.log(`\n⚠️  Expected 6 tables but found ${tables.rows.length}`);
    }

  } catch (error: any) {
    console.error(`\n❌ Setup failed:`, error.message);
    process.exit(1);
  }
}

setupDatabase();
