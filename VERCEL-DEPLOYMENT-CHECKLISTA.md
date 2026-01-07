# ✅ VERCEL DEPLOYMENT CHECKLISTA

**Använd denna checklista innan och efter deployment till Vercel**

---

## 📋 FÖRE DEPLOYMENT

### 1. Miljövariabler i Vercel

Gå till Vercel Dashboard → Ditt projekt → Settings → Environment Variables

Lägg till dessa 7 variabler:

- [ ] `DEMO_MODE=false` ⚠️ KRITISKT!
- [ ] `TURSO_DATABASE_URL` (kopiera från .env.local)
- [ ] `TURSO_AUTH_TOKEN` (kopiera från .env.local)
- [ ] `JWT_SECRET` (kopiera från .env.local) ⚠️ MÅSTE vara samma!
- [ ] `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` (kopiera från .env.local)
- [ ] `STRIPE_SECRET_KEY` (kopiera från .env.local)
- [ ] `NEXT_PUBLIC_APP_URL` (ändra till din Vercel-URL)

### 2. Verifiera Miljövariabler

- [ ] Alla 7 variabler är tillagda
- [ ] `DEMO_MODE` är `false` (inte `true`)
- [ ] `JWT_SECRET` är exakt samma som i .env.local
- [ ] `NEXT_PUBLIC_APP_URL` är din Vercel-URL (inte localhost)
- [ ] Alla variabler är aktiverade för **Production**
- [ ] Alla variabler är aktiverade för **Preview** (valfritt)
- [ ] Alla variabler är aktiverade för **Development** (valfritt)

### 3. Admin-Användare i Databasen

Kontrollera att admin-användaren finns i Turso:

```bash
turso db shell dostar
```

```sql
SELECT email, role FROM users WHERE email = 'ngabulokana@gmail.com';
```

Om admin inte finns, kör:

```sql
INSERT OR REPLACE INTO users (id, email, password_hash, role, created_at, updated_at)
VALUES (
  'admin-prod',
  'ngabulokana@gmail.com',
  '$2a$10$MbdGuGhBo0B5bcQgWQbkr.lui7J/spf8wkX45peMO3XmCS0Vc7CBS',
  'admin',
  datetime('now'),
  datetime('now')
);
```

- [ ] Admin-användare finns i databasen
- [ ] Email är `ngabulokana@gmail.com`
- [ ] Roll är `admin`

### 4. GitHub Push

- [ ] Alla ändringar är committade
- [ ] Kod är pushad till GitHub main branch
- [ ] GitHub är kopplat till Vercel för automatisk deployment

---

## 🚀 DEPLOYMENT

### Automatisk Deployment

```bash
git add .
git commit -m "Production-ready for Vercel"
git push origin main
```

- [ ] Push lyckades
- [ ] Vercel upptäckte push
- [ ] Build startade automatiskt

### Övervaka Deployment

Gå till Vercel Dashboard → Deployments

- [ ] Build status är "Building" eller "Ready"
- [ ] Inga build-fel i loggen
- [ ] Deployment tog ~3-6 minuter
- [ ] Status är "Ready" (grön)

---

## ✅ EFTER DEPLOYMENT

### 1. Grundläggande Tester

#### Test 1: Hemsida
- [ ] Gå till `https://din-url.vercel.app`
- [ ] Sidan laddas korrekt
- [ ] Inga JavaScript-fel i Console (F12)

#### Test 2: Produkter
- [ ] Gå till `https://din-url.vercel.app/products`
- [ ] Produkter visas korrekt
- [ ] Bilder laddas
- [ ] Priser visas

### 2. Registrering & Inloggning

#### Test 3: Registrera Ny Användare
- [ ] Gå till `https://din-url.vercel.app/register`
- [ ] Fyll i email: `test@gmail.com`
- [ ] Fyll i lösenord: `testpassword123`
- [ ] Klicka "Registrera"
- [ ] Omdirigeras till `/products`
- [ ] Användare är inloggad (se header)

#### Test 4: Logga Ut
- [ ] Klicka "Logga ut" i header
- [ ] Omdirigeras till startsidan
- [ ] Användare är utloggad

#### Test 5: Logga In
- [ ] Gå till `https://din-url.vercel.app/login`
- [ ] Fyll i email: `test@gmail.com`
- [ ] Fyll i lösenord: `testpassword123`
- [ ] Klicka "Logga In"
- [ ] Omdirigeras till `/products`
- [ ] Användare är inloggad

#### Test 6: Felaktigt Lösenord
- [ ] Gå till `https://din-url.vercel.app/login`
- [ ] Fyll i email: `test@gmail.com`
- [ ] Fyll i felaktigt lösenord: `wrongpassword`
- [ ] Klicka "Logga In"
- [ ] Felmeddelande visas
- [ ] Användare är INTE inloggad

### 3. Admin-Funktionalitet

#### Test 7: Admin-Login
- [ ] Gå till `https://din-url.vercel.app/admin/login`
- [ ] Fyll i email: `ngabulokana@gmail.com`
- [ ] Fyll i lösenord: `a-z, A-Z, 0-9`
- [ ] Klicka "Logga In"
- [ ] Omdirigeras till `/admin`
- [ ] Admin-panel visas

#### Test 8: Admin-Produkter
- [ ] Gå till `https://din-url.vercel.app/admin/products`
- [ ] Produktlista visas
- [ ] Kan klicka på "Redigera"
- [ ] Kan klicka på "Lägg till produkt"

### 4. E-handel Funktionalitet

#### Test 9: Lägg Till i Varukorg
- [ ] Gå till en produktsida
- [ ] Klicka "Lägg till i varukorg"
- [ ] Varukorg-ikon uppdateras
- [ ] Gå till `/cart`
- [ ] Produkt visas i varukorgen

#### Test 10: Checkout (Valfritt - kräver Stripe test-kort)
- [ ] Gå till `/checkout`
- [ ] Fyll i leveransadress
- [ ] Fyll i Stripe test-kort: `4242 4242 4242 4242`
- [ ] Expiry: `12/34`, CVC: `123`
- [ ] Klicka "Betala"
- [ ] Omdirigeras till `/payment-success`

### 5. Prestanda & Säkerhet

#### Test 11: Prestanda
- [ ] Öppna DevTools (F12) → Network
- [ ] Ladda om sidan
- [ ] Första laddning < 3 sekunder
- [ ] Bilder laddas snabbt
- [ ] Inga 404-fel

#### Test 12: Säkerhet
- [ ] HTTPS är aktiverat (lås-ikon i adressfältet)
- [ ] Inga säkerhetsvarningar i Console
- [ ] Rate limiting fungerar (testa logga in 10 gånger snabbt)

### 6. Mobil-Responsivitet

#### Test 13: Mobil-Vy
- [ ] Öppna DevTools (F12) → Toggle device toolbar
- [ ] Välj "iPhone 12 Pro"
- [ ] Navigera genom sidan
- [ ] Allt visas korrekt
- [ ] Knappar är klickbara
- [ ] Text är läsbar

---

## 🔧 FELSÖKNING

### Om något inte fungerar:

#### Problem: "Databas ej tillgänglig"
- [ ] Kontrollera `TURSO_DATABASE_URL` i Vercel
- [ ] Kontrollera `TURSO_AUTH_TOKEN` i Vercel
- [ ] Redeploya projektet

#### Problem: "Inloggning misslyckades"
- [ ] Kontrollera `JWT_SECRET` i Vercel
- [ ] Måste vara samma som i .env.local
- [ ] Redeploya projektet

#### Problem: "Admin kan inte logga in"
- [ ] Kör SQL-kommandot för att skapa admin (se ovan)
- [ ] Kontrollera att email är `ngabulokana@gmail.com`
- [ ] Kontrollera att lösenord är `a-z, A-Z, 0-9`

#### Problem: "Sidan laddas inte"
- [ ] Kontrollera Vercel Deployment status
- [ ] Kontrollera Function Logs i Vercel
- [ ] Kontrollera att build lyckades

---

## 📊 DEPLOYMENT STATUS

När alla tester är godkända:

- [ ] ✅ Hemsida fungerar
- [ ] ✅ Produkter visas
- [ ] ✅ Registrering fungerar
- [ ] ✅ Inloggning fungerar
- [ ] ✅ Admin-login fungerar
- [ ] ✅ Varukorg fungerar
- [ ] ✅ Checkout fungerar (valfritt)
- [ ] ✅ Prestanda är bra
- [ ] ✅ Säkerhet är aktiverad
- [ ] ✅ Mobil-vy fungerar

---

## 🎉 KLART!

**Din e-handel är nu live på Vercel!** 🚀

### Nästa Steg:

1. **Custom Domain (Valfritt):**
   - Gå till Vercel → Settings → Domains
   - Lägg till `aurelia-market.com`
   - Uppdatera DNS-inställningar
   - Uppdatera `NEXT_PUBLIC_APP_URL`

2. **Övervaka:**
   - Kontrollera Vercel Analytics
   - Kontrollera Function Logs
   - Kontrollera Error Tracking

3. **Marknadsföring:**
   - Dela din URL
   - Testa med riktiga kunder
   - Samla feedback

---

**Status:** Produktionsklar ✅  
**Deployment:** Lyckad ✅  
**Redo för kunder:** Ja ✅
