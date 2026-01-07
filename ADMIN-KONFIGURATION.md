# Administratörskonfiguration
**Datum:** 2025-01-07  
**Status:** ✅ Konfigurerad

## Översikt
Separat administratörsinloggning med restriktiv åtkomst endast för behörig administratör.

## Administratörsinformation

### Behörig Administratör
**Email:** `ngabulokana75@gmail.com`  
**Roll:** `admin`  
**Åtkomst:** Full administratörsåtkomst till alla funktioner

### Inloggningssida
**URL:** `/admin/login`  
**Beskrivning:** Dedikerad inloggningssida endast för administratörer

## Domän & Kontaktinformation

### Domän
**Huvuddomän:** `aurelia-market.com`  
**URL:** `https://aurelia-market.com`

### Kontakt
**Support Email:** `info@aurelia-market.com`  
**Admin Email:** `ngabulokana75@gmail.com`  
**Supporttider:** Mån-Fre 09:00-17:00

## Säkerhetsfunktioner

### 1. Email-restriktion ✅
- Endast `ngabulokana75@gmail.com` kan logga in som admin
- Validering på både klient och server-sidan
- Automatisk avvisning av andra email-adresser

### 2. Roll-baserad åtkomst ✅
- Automatisk admin-roll för `ngabulokana75@gmail.com` vid registrering
- Kunder får automatiskt `customer` roll
- Roll-kontroll i alla admin-endpoints

### 3. Säker inloggning ✅
- Bcrypt password hashing
- JWT token-autentisering
- Rate limiting mot brute-force
- Loggning av alla inloggningsförsök

### 4. Visuell säkerhet ✅
- Tydlig säkerhetsvarning på inloggningssidan
- Röd säkerhetsbadge
- Varning om loggning av försök
- Information om rättsliga konsekvenser

## Implementerade Filer

### 1. Admin Login Page
**Fil:** `src/app/admin/login/page.tsx`

**Funktioner:**
- Dedikerad inloggningssida för admin
- Email-validering mot `ngabulokana75@gmail.com`
- Roll-kontroll efter inloggning
- Säkerhetsvarningar och badges
- Länk till kundinloggning
- Responsiv design

**Design:**
- Gradient bakgrund (svart/grå)
- Animerade bakgrundselement
- Premium säkerhetskänsla
- Tydliga varningar

### 2. Konfigurationsfil
**Fil:** `src/lib/config.ts`

**Innehåll:**
```typescript
export const APP_CONFIG = {
  domain: 'aurelia-market.com',
  supportEmail: 'info@aurelia-market.com',
  adminEmail: 'ngabulokana75@gmail.com',
  admin: {
    allowedEmail: 'ngabulokana75@gmail.com',
    loginPath: '/admin/login',
  },
};
```

**Hjälpfunktioner:**
- `isAdminEmail(email)` - Kontrollerar om email är admin
- `getSupportEmail()` - Returnerar support-email
- `getDomain()` - Returnerar domän

### 3. Uppdaterad Register Route
**Fil:** `src/app/api/auth/register/route.ts`

**Ändringar:**
- Import av `isAdminEmail` från config
- Automatisk admin-roll för `ngabulokana75@gmail.com`
- Kunder får `customer` roll

**Logik:**
```typescript
const role = isAdminEmail(email) ? 'admin' : 'customer';
```

### 4. Uppdaterad Kontaktinformation
**Filer uppdaterade:**
- `src/app/orders/[id]/page.tsx` - Support-email uppdaterad
- `.env.example` - Nya miljövariabler

## Användarflöden

### Flöde 1: Admin registrerar sig första gången
1. Admin navigerar till `/register`
2. Fyller i `ngabulokana75@gmail.com` och lösenord
3. System känner igen admin-email
4. Användare skapas med `role: 'admin'`
5. JWT token genereras med admin-roll
6. Admin kan nu logga in på `/admin/login`

### Flöde 2: Admin loggar in
1. Admin navigerar till `/admin/login`
2. Fyller i `ngabulokana75@gmail.com` och lösenord
3. System validerar email (måste vara admin-email)
4. System validerar lösenord
5. System kontrollerar att roll är `admin`
6. JWT token genereras
7. Redirect till `/admin` dashboard

### Flöde 3: Kund försöker logga in som admin ❌
1. Kund navigerar till `/admin/login`
2. Fyller i sin email (inte admin-email)
3. System visar fel: "Endast administratörer kan logga in här"
4. Inloggning nekas
5. Kund hänvisas till `/login`

### Flöde 4: Admin med fel roll försöker logga in ❌
1. Användare med admin-email men `customer` roll försöker logga in
2. Inloggning lyckas initialt
3. Roll-kontroll misslyckas
4. Fel visas: "Du har inte administratörsbehörighet"
5. Åtkomst nekas

## Miljövariabler

### .env.local (Produktion)
```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://aurelia-market.com
NEXT_PUBLIC_DOMAIN=aurelia-market.com
NEXT_PUBLIC_SUPPORT_EMAIL=info@aurelia-market.com
NEXT_PUBLIC_ADMIN_EMAIL=ngabulokana75@gmail.com
```

### .env.example (Mall)
```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DOMAIN=aurelia-market.com
NEXT_PUBLIC_SUPPORT_EMAIL=info@aurelia-market.com
NEXT_PUBLIC_ADMIN_EMAIL=ngabulokana75@gmail.com
```

## Admin Dashboard

### Befintliga Admin-sidor
1. **Dashboard:** `/admin` - Översikt
2. **Produkter:** `/admin/products` - Hantera produkter
3. **Ny Produkt:** `/admin/products/new` - Skapa produkt
4. **Redigera Produkt:** `/admin/products/[id]` - Redigera produkt
5. **Ordrar:** `/admin/orders` - Hantera ordrar
6. **Order Detaljer:** `/admin/orders/[id]` - Orderdetaljer

### Åtkomstskydd
Alla admin-sidor är skyddade med:
- JWT token-validering
- Roll-kontroll (`role === 'admin'`)
- Redirect till login om ej autentiserad

## Säkerhetsloggning

### Vad loggas
- Alla inloggningsförsök på `/admin/login`
- Felaktiga email-adresser
- Felaktiga lösenord
- Lyckade inloggningar
- Roll-kontroll-fel

### Varningar på inloggningssidan
```
Säkerhetsmeddelande:
Alla inloggningsförsök loggas. Obehörig åtkomst är förbjuden 
och kan leda till rättsliga åtgärder.
```

## Testning

### Test 1: Admin kan registrera sig ✅
```
Email: ngabulokana75@gmail.com
Password: minst8tecken
Förväntat: Användare skapas med role='admin'
```

### Test 2: Admin kan logga in ✅
```
URL: /admin/login
Email: ngabulokana75@gmail.com
Password: korrekt lösenord
Förväntat: Inloggning lyckas, redirect till /admin
```

### Test 3: Kund kan inte logga in som admin ❌
```
URL: /admin/login
Email: kund@example.com
Password: korrekt lösenord
Förväntat: Fel "Endast administratörer kan logga in här"
```

### Test 4: Fel email på admin-login ❌
```
URL: /admin/login
Email: annan@gmail.com
Password: något lösenord
Förväntat: Fel "Endast administratörer kan logga in här"
```

## Framtida förbättringar (Valfritt)

### Fas 2
1. **2FA (Two-Factor Authentication):** Extra säkerhetslager för admin
2. **IP-whitelist:** Begränsa admin-åtkomst till specifika IP-adresser
3. **Audit log:** Detaljerad logg av alla admin-åtgärder
4. **Session timeout:** Automatisk utloggning efter inaktivitet
5. **Email-notifikationer:** Notifiera admin vid inloggning

### Fas 3
1. **Backup admin:** Möjlighet att lägga till sekundär admin
2. **Rollhantering:** Fler roller (super-admin, moderator, etc.)
3. **Behörigheter:** Granulär kontroll av vad varje roll kan göra
4. **Admin-aktivitetslogg:** Dashboard för att se alla admin-åtgärder

## Sammanfattning

### Implementerat ✅
- ✅ Separat admin-inloggningssida (`/admin/login`)
- ✅ Email-restriktion (endast `ngabulokana75@gmail.com`)
- ✅ Automatisk admin-roll vid registrering
- ✅ Roll-baserad åtkomstskontroll
- ✅ Säkerhetsvarningar och badges
- ✅ Uppdaterad kontaktinformation (`info@aurelia-market.com`)
- ✅ Domänkonfiguration (`aurelia-market.com`)
- ✅ Konfigurationsfil för centraliserad hantering

### Säkerhet ✅
- ✅ Bcrypt password hashing
- ✅ JWT token-autentisering
- ✅ Rate limiting
- ✅ Input sanitization
- ✅ Roll-validering
- ✅ Email-validering

### Användarvänlighet ✅
- ✅ Tydlig separation mellan admin och kund-login
- ✅ Visuella säkerhetsvarningar
- ✅ Responsiv design
- ✅ Länk till kundinloggning från admin-login

**Status:** ✅ Klart för produktion

## Kontaktinformation

**Support:** info@aurelia-market.com  
**Admin:** ngabulokana75@gmail.com  
**Domän:** aurelia-market.com
