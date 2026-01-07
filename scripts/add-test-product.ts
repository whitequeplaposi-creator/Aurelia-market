import { createClient } from '@libsql/client/web';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoAuthToken) {
  console.error('❌ TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env.local');
  process.exit(1);
}

async function addTestProduct() {
  console.log('🧪 Lägger till testprodukt för betalningstest...\n');

  const client = createClient({
    url: tursoUrl!,
    authToken: tursoAuthToken!,
  });

  try {
    // Check if test product already exists
    const existing = await client.execute(`
      SELECT id FROM products WHERE name = 'Testprodukt 4kr'
    `);

    if (existing.rows.length > 0) {
      console.log('⚠️  Testprodukten finns redan!');
      console.log('Produkt ID:', existing.rows[0].id);
      return;
    }

    // Insert test product
    const result = await client.execute({
      sql: `
        INSERT INTO products (
          name, description, price, image, stock, category, active
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?
        )
      `,
      args: [
        'Testprodukt 4kr',
        'En billig testprodukt för att testa betalningar med Stripe. Perfekt för att verifiera att betalningsflödet fungerar korrekt.',
        4.00,
        'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&h=800&fit=crop',
        100,
        'Test',
        1
      ]
    });

    console.log('✅ Testprodukt tillagd!');
    console.log('\n📦 Produktdetaljer:');
    console.log('   Namn: Testprodukt 4kr');
    console.log('   Pris: 4.00 kr');
    console.log('   Lager: 100');
    console.log('   Kategori: Test');
    console.log('\n🎯 Nästa steg:');
    console.log('   1. Gå till /products för att se testprodukten');
    console.log('   2. Lägg till i kundvagn');
    console.log('   3. Gå till kassan');
    console.log('   4. Genomför betalning med Stripe');
    console.log('   5. Verifiera betalning i Stripe Dashboard');

  } catch (error: any) {
    console.error('\n❌ Error adding test product:', error.message);
    process.exit(1);
  }
}

addTestProduct();
