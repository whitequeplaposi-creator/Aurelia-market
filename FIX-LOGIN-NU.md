# 🔧 FIXA LOGIN NU - Steg för Steg

## ÅTGÄRD 1: Starta Om Servern (VIKTIGT!)

```bash
# Stoppa servern (tryck Ctrl+C i terminalen där den körs)
# Starta om:
npm run dev
```

**Varför?** Alla kodändringar kräver omstart för att aktiveras.

## ÅTGÄRD 2: Öppna Webbläsarens Console

1. Öppna Chrome/Edge
2. Gå till http://localhost:3000/login
3. Tryck F12 (öppnar Developer Tools)
4. Klicka på "Console" fliken
5. Klicka på "Network" fliken
6. Försök logga in med: test@example.com / test123456
7. Leta efter "/api/auth/login" i Network-listan
8. Klicka på den
9. Kolla "Response" fliken

**Vad ser du?**
- Tom response? → Servern kraschar
- HTML error page? → Next.js error
- JSON med "error"? → Databas/lösenordsproblem

## ÅTGÄRD 3: Kolla Server-Loggar

I terminalen där `npm run dev` körs, leta efter:

**BRA tecken:**
```
🔐 Login request received
📧 Login attempt for: test@example.com
🔍 Querying database for user...
✅ User found, verifying password...
✅ Login successful
```

**DÅLIGA tecken:**
```
❌ Turso client not initialized
❌ User not found
❌ Invalid password
Error: ...
```

## ÅTGÄRD 4: Verifiera .env.local

Öppna `.env.local` och kontrollera:

```env
DEMO_MODE=false
TURSO_DATABASE_URL=libsql://dostar-dostar.aws-ap-northeast-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3NjUzMDksImlkIjoiYTU1OTcwMzctMzQ1Zi00ODQ2LTgyMTYtNWJkNzEyYmRkMmRlIiwicmlkIjoiMDMxOTcwYzYtMzllNS00MzYyLWIwMDItM2M4OGYzNDNjOGZkIn0.JuHL0gDgcdH0Yg1euuPpFBURYGc8Q2i5FvnAJdGtYcy41ErdYtbkRkMGrxbGLtUWMTWklX8Fee6uLRXOhmmjDQ
JWT_SECRET=aurelia-market-jwt-secret-2024-change-this-to-random-string
```

**Saknas något?** Lägg till det!

## ÅTGÄRD 5: Testa Med Script

```bash
node test-login-http.js
```

**Om det fungerar här men inte i webbläsaren:**
→ Problem med frontend (AuthContext)

**Om det INTE fungerar här:**
→ Problem med backend (API route eller databas)

## ÅTGÄRD 6: Aktivera Demo-Läge (Temporär Lösning)

Om inget annat fungerar, aktivera demo-läge:

1. Öppna `.env.local`
2. Ändra: `DEMO_MODE=true`
3. Spara
4. Starta om servern: `npm run dev`
5. Testa login igen

**Detta bör fungera omedelbart!**

## VANLIGA PROBLEM & LÖSNINGAR

### Problem 1: "Turso client not initialized"
**Lösning:**
```bash
# Kontrollera att .env.local finns
dir .env.local

# Om den saknas, kopiera från exempel
copy .env.example .env.local

# Redigera .env.local med rätt värden
```

### Problem 2: "User not found"
**Lösning:**
```bash
# Återskapa databasen
npx tsx setup-turso-final.ts
```

### Problem 3: Servern kraschar
**Lösning:**
```bash
# Rensa cache och starta om
Remove-Item -Recurse -Force .next
npm run dev
```

### Problem 4: "Invalid password"
**Lösning:**
Använd exakt: `test123456` (inga mellanslag, rätt case)

## SNABB-FIX: Använd Demo-Läge

**Steg 1:** Öppna `.env.local`
**Steg 2:** Ändra till: `DEMO_MODE=true`
**Steg 3:** Spara och starta om servern
**Steg 4:** Login fungerar nu!

Detta använder mock-data istället för databasen.

## KONTAKTA MIG MED DENNA INFO

Om inget fungerar, ge mig:

1. **Server-loggar:** Kopiera allt från terminalen där `npm run dev` körs
2. **Browser console:** Kopiera felmeddelanden från F12 → Console
3. **Network response:** Kopiera svaret från F12 → Network → /api/auth/login
4. **Test-script output:** Kopiera output från `node test-login-http.js`

Med denna info kan jag ge exakt lösning!
