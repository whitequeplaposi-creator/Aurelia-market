// Test Authentication for Vercel Deployment
// Run this after deploying to Vercel to verify authentication works

const VERCEL_URL = process.argv[2] || 'http://localhost:3000';

console.log('🧪 TESTAR AUTENTISERING PÅ VERCEL\n');
console.log('URL:', VERCEL_URL);
console.log('='.repeat(50));

async function testRegistration() {
  console.log('\n📝 TEST 1: Registrera ny användare');
  
  const testEmail = `test${Date.now()}@gmail.com`;
  const testPassword = 'testpassword123';
  
  console.log('Email:', testEmail);
  console.log('Lösenord:', testPassword);
  
  try {
    const response = await fetch(`${VERCEL_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    console.log('Status:', response.status, response.statusText);
    console.log('Content-Type:', response.headers.get('content-type'));

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registrering lyckades!');
      console.log('   Användare:', data.user.email);
      console.log('   Roll:', data.user.role);
      console.log('   Token:', data.token ? 'Genererad ✓' : 'Saknas ✗');
      return { success: true, email: testEmail, password: testPassword };
    } else {
      console.log('❌ Registrering misslyckades:', data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.log('❌ Fel vid registrering:', error.message);
    return { success: false, error: error.message };
  }
}

async function testLogin(email, password) {
  console.log('\n🔐 TEST 2: Logga in med registrerad användare');
  console.log('Email:', email);
  
  try {
    const response = await fetch(`${VERCEL_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    console.log('Status:', response.status, response.statusText);
    console.log('Content-Type:', response.headers.get('content-type'));

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Inloggning lyckades!');
      console.log('   Användare:', data.user.email);
      console.log('   Roll:', data.user.role);
      console.log('   Token:', data.token ? 'Genererad ✓' : 'Saknas ✗');
      return { success: true };
    } else {
      console.log('❌ Inloggning misslyckades:', data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.log('❌ Fel vid inloggning:', error.message);
    return { success: false, error: error.message };
  }
}

async function testInvalidLogin() {
  console.log('\n🚫 TEST 3: Testa felaktigt lösenord');
  
  try {
    const response = await fetch(`${VERCEL_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    });

    const data = await response.json();
    
    if (!response.ok && response.status === 401) {
      console.log('✅ Felaktigt lösenord avvisades korrekt');
      console.log('   Felmeddelande:', data.error);
      return { success: true };
    } else {
      console.log('❌ Felaktigt lösenord accepterades (BUG!)');
      return { success: false };
    }
  } catch (error) {
    console.log('❌ Fel vid test:', error.message);
    return { success: false, error: error.message };
  }
}

async function testAdminLogin() {
  console.log('\n👑 TEST 4: Testa admin-inloggning');
  
  try {
    const response = await fetch(`${VERCEL_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'ngabulokana@gmail.com',
        password: 'a-z, A-Z, 0-9',
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin-inloggning lyckades!');
      console.log('   Användare:', data.user.email);
      console.log('   Roll:', data.user.role);
      return { success: true };
    } else {
      console.log('⚠️  Admin-inloggning misslyckades:', data.error);
      console.log('   Detta är OK om admin inte finns i databasen än');
      return { success: false, expected: true };
    }
  } catch (error) {
    console.log('❌ Fel vid admin-inloggning:', error.message);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('\nStartar tester...\n');
  
  const results = {
    registration: null,
    login: null,
    invalidLogin: null,
    adminLogin: null,
  };
  
  // Test 1: Registration
  const regResult = await testRegistration();
  results.registration = regResult.success;
  
  // Test 2: Login (only if registration succeeded)
  if (regResult.success) {
    const loginResult = await testLogin(regResult.email, regResult.password);
    results.login = loginResult.success;
  } else {
    console.log('\n⏭️  Hoppar över login-test (registrering misslyckades)');
    results.login = false;
  }
  
  // Test 3: Invalid login
  const invalidResult = await testInvalidLogin();
  results.invalidLogin = invalidResult.success;
  
  // Test 4: Admin login
  const adminResult = await testAdminLogin();
  results.adminLogin = adminResult.success;
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TESTRESULTAT\n');
  console.log('Registrering:', results.registration ? '✅ OK' : '❌ MISSLYCKADES');
  console.log('Inloggning:', results.login ? '✅ OK' : '❌ MISSLYCKADES');
  console.log('Felaktigt lösenord:', results.invalidLogin ? '✅ OK' : '❌ MISSLYCKADES');
  console.log('Admin-inloggning:', results.adminLogin ? '✅ OK' : '⚠️  Kräver SQL-setup');
  
  const criticalTestsPassed = results.registration && results.login && results.invalidLogin;
  
  console.log('\n' + '='.repeat(50));
  if (criticalTestsPassed) {
    console.log('✅ ALLA KRITISKA TESTER GODKÄNDA!');
    console.log('\nSystemet fungerar korrekt på Vercel.');
    console.log('Kunder kan nu registrera sig och logga in.');
  } else {
    console.log('❌ VISSA TESTER MISSLYCKADES');
    console.log('\nKontrollera:');
    console.log('1. Att miljövariabler är korrekt satta i Vercel');
    console.log('2. Att TURSO_DATABASE_URL och TURSO_AUTH_TOKEN är korrekta');
    console.log('3. Att JWT_SECRET är satt');
    console.log('4. Att DEMO_MODE=false');
  }
  
  console.log('\n📝 NÄSTA STEG:');
  if (criticalTestsPassed) {
    console.log('1. Testa registrera dig på webbplatsen');
    console.log('2. Testa logga in');
    console.log('3. Kör SQL-kommandona för att skapa admin-användare');
  } else {
    console.log('1. Kontrollera Vercel Environment Variables');
    console.log('2. Redeploya projektet');
    console.log('3. Kör detta test igen');
  }
}

// Run tests
runAllTests().catch(console.error);
