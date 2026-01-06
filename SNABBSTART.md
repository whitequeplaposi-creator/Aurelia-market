# 🚀 Snabbstart - Aurelia Market

## Steg 1: Hämta Service Role Key

1. Gå till: https://supabase.com/dashboard/project/pymtloyqohxpvlzmvqfy/settings/api
2. Scrolla ner till **service_role key** (secret)
3. Kopiera nyckeln (börjar med `eyJ...`)
4. Öppna `.env.local` och ersätt `din-service-key-här` med din riktiga nyckel

## Steg 2: Skapa databastabeller

1. Gå till: https://supabase.com/dashboard/project/pymtloyqohxpvlzmvqfy/editor
2. Klicka på **SQL Editor** (vänster meny)
3. Klicka **New Query**
4. Kopiera HELA innehållet från `database/schema.sql`
5. Klistra in och klicka **Run**

## Steg 3: Lägg till testprodukter

1. I samma SQL Editor, skapa en ny query
2. Kopiera innehållet från `database/setup-testdata.sql`
3. Klistra in och klicka **Run**

## Steg 4: Starta utvecklingsservern

```bash
npm install
npm run dev
```

Öppna: http://localhost:3000

## Steg 5: Testa!

### ✅ Se produkter
- Gå till http://localhost:3000/products
- Du ska se 6 produkter
- Testa sökfunktionen!

### ✅ Registrera användare
1. Gå till http://localhost:3000/register
2. Email: `test@example.com`
3. Lösenord: `test1234` (minst 8 tecken)
4. Klicka **Registrera**

### ✅ Logga in
1. Gå till http://localhost:3000/login
2. Använd samma uppgifter
3. Du är nu inloggad!

### ✅ Testa kundvagn
1. Gå till produkter
2. Klicka på en produkt
3. Klicka **Lägg till i kundvagn**
4. Gå till kundvagnen (ikon i header)

### ✅ Skapa admin-användare

1. Registrera en användare först (t.ex. `admin@aureliamarket.se`)
2. Gå till Supabase SQL Editor
3. Kör denna SQL:
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@aureliamarket.se';
```
4. Logga ut och in igen
5. Gå till http://localhost:3000/admin

## 🎉 Klart!

Nu har du:
- ✅ Sökfunktion
- ✅ Produkter från Supabase
- ✅ Registrering/Inloggning
- ✅ Kundvagn
- ✅ Admin-panel (om du skapade admin)

## 🐛 Problem?

### "Failed to fetch products"
- Kontrollera att service_role key är korrekt i `.env.local`
- Starta om servern: `Ctrl+C` och sedan `npm run dev`

### "Registration failed"
- Öppna browser console (F12) för mer info
- Kontrollera att tabellerna är skapade i Supabase

### Inga produkter visas
- Kontrollera att du körde `setup-testdata.sql`
- Gå till Supabase och kolla Table Editor → products

## 📝 Nästa steg

När allt fungerar lokalt:
1. Konfigurera Stripe för betalningar (se DEPLOYMENT.md)
2. Deploya till Vercel
3. Lägg till fler produkter via admin-panelen
