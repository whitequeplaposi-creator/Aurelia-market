import { createClient } from '@libsql/client/web';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoAuthToken) {
  console.error('❌ TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
  process.exit(1);
}

async function verifyTestProduct() {
  console.log('🔍 Verifierar testprodukt...\n');

  const client = createClient({
    url: tursoUrl!,
    authToken: tursoAuthToken!,
  });

  try {
    // Get test product
    const result = await client.execute(`
      SELECT * FROM products WHERE name = 'Testprodukt 4kr'
    `);

    if (result.rows.length === 0) {
      console.log('❌ Testprodukten hittades inte!');
      return;
    }

    const product = result.rows[0];
    console.log('✅ Testprodukt hittad!\n');
    console.log('📦 Produktinformation:');
    console.log('   ID:', product.id);
    console.log('   Namn:', product.name);
    console.log('   Beskrivning:', product.description);
    console.log('   Pris:', product.price, 'kr');
    console.log('   Lager:', product.stock);
    console.log('   Kategori:', product.category);
    console.log('   Aktiv:', product.active === 1 ? 'Ja' : 'Nej');
    console.log('   Skapad:', product.created_at);

    // Get all products count
    const countResult = await client.execute('SELECT COUNT(*) as count FROM products');
    console.log('\n📊 Totalt antal produkter i databasen:', countResult.rows[0].count);

  } catch (error: any) {
    console.error('\n❌ Fel vid verifiering:', error.message);
    process.exit(1);
  }
}

verifyTestProduct();
