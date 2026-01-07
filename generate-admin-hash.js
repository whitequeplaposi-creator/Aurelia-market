const bcrypt = require('bcryptjs');

async function generateAdminHash() {
  console.log('🔐 Genererar lösenords-hash för admin...\n');
  
  const adminEmail = 'ngabulokana@gmail.com';
  const adminPassword = 'a-z, A-Z, 0-9';
  
  const hash = await bcrypt.hash(adminPassword, 10);
  
  console.log('📋 Admin-uppgifter:');
  console.log('   Email:', adminEmail);
  console.log('   Lösenord:', adminPassword);
  console.log('\n🔑 Password Hash:');
  console.log(hash);
  
  console.log('\n📝 SQL för att skapa admin (kör i Turso CLI):');
  console.log('');
  console.log(`INSERT INTO users (id, email, password_hash, role, created_at, updated_at)`);
  console.log(`VALUES (`);
  console.log(`  'admin-${Date.now()}',`);
  console.log(`  '${adminEmail}',`);
  console.log(`  '${hash}',`);
  console.log(`  'admin',`);
  console.log(`  datetime('now'),`);
  console.log(`  datetime('now')`);
  console.log(`);`);
  
  console.log('\n✅ Kopiera SQL-kommandot ovan och kör i Turso!');
}

generateAdminHash().catch(console.error);
