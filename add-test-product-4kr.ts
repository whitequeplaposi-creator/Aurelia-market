import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function addTestProduct() {
  try {
    console.log('Lägger till testprodukt för 4 kr...');

    const result = await turso.execute({
      sql: `INSERT INTO products (name, description, price, image, stock, category, active) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'Testprodukt',
        'En billig testprodukt för att testa betalningar med Stripe',
        4.00,
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
        100,
        'Test',
        1
      ]
    });

    console.log('✅ Testprodukt tillagd!');
    console.log('Produkt: Testprodukt');
    console.log('Pris: 4 kr');
    console.log('Lager: 100');
    console.log('Kategori: Test');

    // Verifiera att produkten finns
    const verify = await turso.execute('SELECT * FROM products WHERE name = "Testprodukt"');
    console.log('\nVerifiering:');
    console.log(verify.rows[0]);

  } catch (error) {
    console.error('❌ Fel vid tillägg av produkt:', error);
    throw error;
  }
}

addTestProduct();
