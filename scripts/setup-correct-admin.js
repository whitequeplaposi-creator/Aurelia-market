const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function setupCorrectAdmin() {
  console.log('🔧 Konfigurerar rätt admin-användare...\n');

  try {
    // 1. Ta bort gamla test-användare
    console.log('🗑️  Tar bort gamla test-användare...');
    await turso.execute('DELETE FROM users WHERE email LIKE "%@example.com"');
    await turso.execute('DELETE FROM users WHERE email LIKE "%@aurelia-market.se"');
    await turso.execute('DELETE FROM users WHERE email LIKE "%@demo.com"');
    console.log('✅ Gamla test-användare borttagna\n');

    // 2. Skapa rätt admin-användare
    console.log('👤 Skapar admin-användare...');
    const adminEmail = 'ngabulokana@gmail.com';
    const adminPassword = 'a-z, A-Z, 0-9'; // Exakt som användaren specificerade
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

    // Kontrollera om admin redan finns
    const existingAdmin = await turso.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [adminEmail]
    });

    if (existingAdmin.rows.length > 0) {
      // Uppdatera befintlig admin
      await turso.execute({
        sql: 'UPDATE users SET password_hash = ?, role = ? WHERE email = ?',
        args: [adminPasswordHash, 'admin', adminEmail]
      });
      console.log('✅ Admin-användare uppdaterad');
    } else {
      // Skapa ny admin
      await turso.execute({
        sql: `INSERT INTO users (id, email, password_hash, role, created_at, updated_at)
              VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: ['admin-' + Date.now(), adminEmail, adminPasswordHash, 'admin']
      });
      console.log('✅ Admin-användare skapad');
    }

    console.log('\n📋 Admin-uppgifter:');
    console.log('   Email: ngabulokana@gmail.com');
    console.log('   Lösenord: a-z, A-Z, 0-9');
    console.log('   Roll: admin');

    // 3. Verifiera att inga aurelia-market.se användare finns
    const aureliaUsers = await turso.execute({
      sql: 'SELECT * FROM users WHERE email LIKE "%@aurelia-market.se"',
      args: []
    });

    if (aureliaUsers.rows.length === 0) {
      console.log('\n✅ Inga aurelia-market.se användare finns (korrekt!)');
    } else {
      console.log('\n⚠️  Varning: Hittade aurelia-market.se användare:');
      aureliaUsers.rows.forEach(user => {
        console.log('   -', user.email);
      });
    }

    // 4. Visa alla användare
    const allUsers = await turso.execute('SELECT email, role FROM users');
    console.log('\n📊 Alla användare i databasen:');
    if (allUsers.rows.length === 0) {
      console.log('   (Inga användare än)');
    } else {
      allUsers.rows.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    }

    console.log('\n✅ Konfiguration klar!');
    console.log('\n📝 Nästa steg:');
    console.log('   1. Starta om servern: npm run dev');
    console.log('   2. Testa admin-login på /admin/login');
    console.log('   3. Kunder kan registrera sig med vilken Gmail-adress som helst');

  } catch (error) {
    console.error('❌ Fel:', error);
    throw error;
  }
}

setupCorrectAdmin().catch(console.error);
