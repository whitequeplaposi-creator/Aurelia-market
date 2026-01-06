# 🎭 Demo Mode - Aurelia Market

## Vad är Demo Mode?

Demo Mode låter dig testa e-handeln med fiktiva produkter **utan** att behöva konfigurera Supabase eller databas. Perfekt för att:

- Se hur e-handeln ser ut och fungerar
- Testa UI/UX
- Demonstrera funktionalitet
- Utveckla frontend utan backend-beroenden

## ✅ Vad fungerar i Demo Mode:

### Fullt fungerande:
- ✅ **Produktvisning** - 6 fiktiva smyckesprodukter
- ✅ **Sökfunktion** - Sök bland produkter
- ✅ **Produktdetaljer** - Klicka på produkter för mer info
- ✅ **Responsiv design** - Fungerar på mobil, tablet, desktop
- ✅ **Navigation** - Alla sidor och menyer
- ✅ **UI-komponenter** - Header, Footer, Layout

### Begränsat/Inte fungerande:
- ❌ **Registrering/Inloggning** - Kräver databas
- ❌ **Kundvagn** - Kräver databas för att spara
- ❌ **Beställningar** - Kräver databas
- ❌ **Admin-panel** - Kräver databas och autentisering
- ❌ **Betalningar** - Kräver Stripe-konfiguration

## 🚀 Starta Demo Mode

### 1. Kontrollera att Demo Mode är aktiverat

Öppna `.env.local` och se till att denna rad finns:
```env
DEMO_MODE=true
```

### 2. Starta servern

```bash
npm run dev
```

### 3. Öppna i webbläsaren

- **Startsida:** http://localhost:3000
- **Produkter:** http://localhost:3000/products

## 📦 Fiktiva Produkter

Demo Mode innehåller 6 smyckesprodukter:

1. **Lyxig Guldarmband** - 12,999 kr
2. **Diamantring** - 24,999 kr
3. **Pärla Halsband** - 8,999 kr
4. **Guldörhängen** - 5,999 kr
5. **Silverarmband** - 3,999 kr
6. **Safirring** - 18,999 kr

Alla produkter har:
- Produktnamn
- Beskrivning
- Pris
- Bild (från Unsplash)
- Lagerstatus

## 🔄 Byta till Production Mode

När du är redo att använda riktiga Supabase-uppgifter:

### 1. Uppdatera `.env.local`

```env
# Ändra till false eller ta bort raden
DEMO_MODE=false

# Lägg till dina riktiga Supabase-uppgifter
NEXT_PUBLIC_SUPABASE_URL=https://din-projekt-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=din-anon-key
SUPABASE_SERVICE_KEY=din-service-key
```

### 2. Skapa databas

Kör SQL-scripten i Supabase:
1. `database/schema.sql` - Skapar tabeller
2. `database/setup-testdata.sql` - Lägger till produkter

### 3. Starta om servern

```bash
# Stoppa servern (Ctrl+C)
npm run dev
```

Nu använder applikationen riktiga Supabase-data!

## 🎨 Anpassa Mock Data

Vill du ändra de fiktiva produkterna?

Öppna `src/lib/mockData.ts` och redigera `mockProducts` arrayen:

```typescript
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Din Produkt',
    description: 'Din beskrivning',
    price: 9999,
    image: 'https://din-bild-url.com/image.jpg',
    stock: 10,
    active: true,
    // ...
  },
  // Lägg till fler produkter här
];
```

## 📝 Teknisk Information

### Hur fungerar det?

1. **Environment Variable Check:** API routes kollar `process.env.DEMO_MODE`
2. **Mock Data:** Om `true`, returneras data från `src/lib/mockData.ts`
3. **Supabase Fallback:** Om `false`, används normal Supabase-anslutning

### Filer som stödjer Demo Mode:

- `src/lib/mockData.ts` - Mock data och helper functions
- `src/app/api/products/route.ts` - Produktlista API
- `src/app/api/products/[id]/route.ts` - Enskild produkt API

### Lägg till Demo Mode i fler API routes:

```typescript
import { isDemoMode } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    // Returnera mock data
    return NextResponse.json({ data: mockData });
  }
  
  // Normal Supabase-logik
  const { data } = await supabase.from('table').select();
  return NextResponse.json({ data });
}
```

## 🎯 Nästa Steg

När du är nöjd med hur e-handeln ser ut i Demo Mode:

1. **Skaffa Supabase-konto** - https://supabase.com
2. **Skapa nytt projekt**
3. **Kopiera API-nycklar**
4. **Uppdatera `.env.local`**
5. **Kör SQL-scripts**
6. **Stäng av Demo Mode**

Se `NÄSTA-STEG.md` för detaljerade instruktioner!
