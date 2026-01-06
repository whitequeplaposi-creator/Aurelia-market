# 🚀 Nästa Steg - Kom igång med Aurelia Market

## ✅ Klart:
- Supabase URL och nycklar konfigurerade i `.env.local`
- Sökfunktion tillagd på produktsidan
- Förbättrad felhantering för registrering/inloggning
- Testdata SQL-script skapat

## 📋 Gör detta nu:

### 1. Skapa databastabeller i Supabase

**Steg A: Öppna SQL Editor**
1. Gå till: https://supabase.com/dashboard/project/pymtloyqohxpvlzmvqfy/editor
2. Klicka på **SQL Editor** i vänster meny
3. Klicka **New Query**

**Steg B: Kör schema.sql**
1. Öppna filen `database/schema.sql` i din editor
2. Kopiera HELA innehållet (Ctrl+A, Ctrl+C)
3. Klistra in i Supabase SQL Editor
4. Klicka **Run** (eller Ctrl+Enter)
5. Du ska se: "Success. No rows returned"

**Steg C: Lägg till testprodukter**
1. Skapa en ny query i SQL Editor
2. Öppna filen `database/setup-testdata.sql`
3. Kopiera innehållet
4. Klistra in i SQL Editor
5. Klicka **Run**
6. Du ska se: "Success. 6 rows affected" (för produkter)

### 2. Starta utvecklingsservern

Öppna terminal och kör:
```bash
npm install
npm run dev
```

Vänta tills du ser:
```
✓ Ready in X.Xs
○ Local: http://localhost:3000
```

### 3. Testa funktionaliteten

**A. Se produkter med sökfunktion:**
1. Öppna: http://localhost:3000/products
2. Du ska se 6 produkter (Guldarmband, Diamantring, etc.)
3. Testa sökfältet - skriv "guld" eller "ring"
4. Produkterna filtreras i realtid!

**B. Registrera ny användare:**
1. Gå till: http://localhost:3000/register
2. Email: `test@example.com`
3. Lösenord: `test1234` (minst 8 tecken)
4. Klicka **Registrera**
5. Du blir automatiskt inloggad och omdirigerad till produkter

**C. Logga in:**
1. Logga ut (klicka på användarikonen → Logga ut)
2. Gå till: http://localhost:3000/login
3. Använd samma uppgifter
4. Klicka **Logga in**

**D. Testa kundvagn:**
1. Gå till produkter
2. Klicka på en produkt
3. Klicka **Lägg till i kundvagn**
4. Klicka på kundvagnsikonen i header
5. Du ska se produkten i kundvagnen!

### 4. Skapa admin-användare (valfritt)

**Metod 1: Via SQL**
1. Registrera först en användare (t.ex. `admin@aureliamarket.se`)
2. Gå till Supabase SQL Editor
3. Kör denna SQL:
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@aureliamarket.se';
```
4. Logga ut och in igen
5. Gå till: http://localhost:3000/admin

**Metod 2: Direkt i Supabase**
1. Gå till Table Editor → users
2. Hitta din användare
3. Ändra `role` från `customer` till `admin`
4. Logga ut och in igen

## 🎉 Klart!

Nu har du:
- ✅ Fungerande e-handel lokalt
- ✅ Sökfunktion
- ✅ Registrering/Inloggning
- ✅ Produkter från Supabase
- ✅ Kundvagn
- ✅ Admin-panel (om du skapade admin)

## 🐛 Felsökning

### Problem: "Failed to fetch products"
**Lösning:**
1. Kontrollera att du körde `schema.sql` och `setup-testdata.sql`
2. Gå till Supabase → Table Editor → products
3. Kontrollera att det finns 6 produkter
4. Starta om servern: `Ctrl+C` och `npm run dev`

### Problem: "Registration failed"
**Lösning:**
1. Öppna browser console (F12)
2. Kolla efter felmeddelanden
3. Kontrollera att `users` tabellen finns i Supabase
4. Kontrollera att JWT_SECRET är satt i `.env.local`

### Problem: Inga produkter visas
**Lösning:**
1. Kontrollera att `active = true` för produkterna
2. Kör denna SQL i Supabase:
```sql
SELECT * FROM products WHERE active = true;
```
3. Om inga resultat, kör `setup-testdata.sql` igen

### Problem: RLS (Row Level Security) fel
**Lösning:**
Om du får "new row violates row-level security policy":
1. Gå till Supabase → Authentication → Policies
2. För varje tabell, lägg till policies:
   - Enable insert for authenticated users
   - Enable select for authenticated users
   - Enable update for authenticated users

Eller kör denna SQL för att tillfälligt inaktivera RLS (endast för utveckling):
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
```

## 📝 Nästa fas: Deployment

När allt fungerar lokalt:
1. Konfigurera Stripe för betalningar
2. Deploya till Vercel
3. Konfigurera production environment variables
4. Testa live-versionen

Se `DEPLOYMENT.md` för detaljer!
