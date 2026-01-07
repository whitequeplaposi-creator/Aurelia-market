const http = require('http');

const postData = JSON.stringify({
  email: 'ngabulokana75@gmail.com',
  password: 'admin123456'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Testar admin-inloggning...\n');
console.log('Försöker logga in med:');
console.log('  Email: ngabulokana75@gmail.com');
console.log('  Password: admin123456\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response status:', res.statusCode);
    console.log('Response data:', data);
    
    if (res.statusCode === 200) {
      const parsed = JSON.parse(data);
      console.log('\n✅ Admin-inloggning lyckades!');
      console.log('Roll:', parsed.user.role);
    } else {
      console.log('\n❌ Admin-inloggning misslyckades!');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Fel vid anslutning:', error.message);
  console.log('\n⚠️  Kontrollera att servern körs på http://localhost:3000');
});

req.write(postData);
req.end();
