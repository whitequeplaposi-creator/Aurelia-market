# Fix: Registrerings- och JSON-problem

## Problem
Registreringsfunktionen fungerade inte på grund av:
1. JSON-hanteringsproblem i autentiserings-API:erna
2. "Unexpected end of JSON input" fel vid registrering
3. Rate limiting som kastade fel utan att returnera JSON-svar

## Rotorsaker

### 1. DOMPurify-problem
`DOMPurify.sanitize()` returnerar alltid en **sträng**, inte ett objekt. När vi saniterade ett objekt med `email` och `password`, konverterades värdena på ett sätt som kunde orsaka problem med JSON-parsing och validering.

### 2. Rate Limiting-fel
`strictRateLimit()` kastade `ApiError` som inte fångades korrekt, vilket resulterade i att inget JSON-svar returnerades till klienten.

### 3. Klient-side JSON-parsing
`AuthContext` anropade `response.json()` direkt utan att kontrollera om svaret faktiskt innehöll giltig JSON.

## Lösningar

### 1. Förbättrad `sanitizeInput`-funktion (src/middleware/security.ts)

**Tidigare problem:**
- `DOMPurify.sanitize()` returnerade strängar utan att hantera dem korrekt
- Ingen trimning av whitespace
- Ingen kontroll av `hasOwnProperty` vid iteration

**Ny implementation:**
```typescript
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Sanitera strängen och trimma whitespace
    const sanitized = DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false
    });
    return typeof sanitized === 'string' ? sanitized.trim() : String(sanitized).trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }
  
  // Returnera primitiva värden som de är (number, boolean, null, undefined)
  return input;
}
```

**Förbättringar:**
- ✅ Explicit hantering av DOMPurify-returvärden
- ✅ Trimning av whitespace från strängar
- ✅ Säker iteration med `hasOwnProperty`
- ✅ Korrekt hantering av primitiva värden

### 2. Förbättrad felhantering i auth API:er

**Register API (src/app/api/auth/register/route.ts):**
```typescript
export async function POST(request: NextRequest) {
  try {
    // Rate limiting med try-catch
    try {
      strictRateLimit(request);
    } catch (rateLimitError: any) {
      return NextResponse.json(
        { error: rateLimitError.message || 'För många förfrågningar, försök igen senare' },
        { status: 429 }
      );
    }
    
    // JSON-parsing med try-catch
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError);
      return NextResponse.json(
        { error: 'Ogiltig förfrågan - JSON-fel' },
        { status: 400 }
      );
    }
    
    // Validering med try-catch
    let validatedData;
    try {
      validatedData = registerSchema.parse(sanitizedBody);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return NextResponse.json(
        { error: 'Ogiltig e-postadress eller lösenord (minst 8 tecken krävs)' },
        { status: 400 }
      );
    }
    // ... rest of code
  }
}
```

**Förbättringar:**
- ✅ Rate limiting fångas och returnerar JSON-svar
- ✅ Explicit JSON-parsing med felhantering
- ✅ Separat validering med tydliga felmeddelanden
- ✅ Svenska felmeddelanden för bättre användarupplevelse

### 3. Robust JSON-hantering i AuthContext (src/contexts/AuthContext.tsx)

**Tidigare problem:**
- `response.json()` anropades direkt utan kontroll
- Ingen hantering av tomma svar
- Ingen kontroll av Content-Type

**Ny implementation:**
```typescript
const register = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // Kontrollera Content-Type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Servern returnerade ett ogiltigt svar');
    }

    // Försök att parsa JSON
    let data;
    try {
      const text = await response.text();
      if (!text || text.trim() === '') {
        throw new Error('Servern returnerade ett tomt svar');
      }
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Kunde inte läsa serverns svar');
    }

    if (!response.ok) {
      throw new Error(data.error || 'Registrering misslyckades');
    }
    
    setUser(data.user);
    setToken(data.token);
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};
```

**Förbättringar:**
- ✅ Kontrollerar Content-Type innan parsing
- ✅ Läser response.text() först för att kontrollera om det är tomt
- ✅ Explicit JSON.parse() med felhantering
- ✅ Tydliga felmeddelanden för olika feltyper

## Felmeddelanden (nu på svenska)

| Tidigare (Engelska) | Nu (Svenska) |
|---------------------|--------------|
| "Invalid credentials" | "Felaktig e-postadress eller lösenord" |
| "Email already registered" | "E-postadressen är redan registrerad" |
| "Registration failed" | "Registrering misslyckades. Försök igen." |
| "Login failed" | "Inloggning misslyckades. Försök igen." |
| - | "För många förfrågningar, försök igen senare" (rate limit) |
| - | "Servern returnerade ett ogiltigt svar" (Content-Type fel) |
| - | "Servern returnerade ett tomt svar" (tomt svar) |
| - | "Kunde inte läsa serverns svar" (JSON parse fel) |

## Testning

### Manuell testning
1. Gå till `/register`
2. Fyll i e-postadress och lösenord (minst 8 tecken)
3. Klicka på "Registrera"
4. Verifiera att registreringen fungerar

### Felfall att testa
- ✅ Tom e-postadress
- ✅ Ogiltig e-postadress
- ✅ För kort lösenord (< 8 tecken)
- ✅ Lösenord matchar inte
- ✅ E-postadress redan registrerad
- ✅ Rate limiting (för många försök)
- ✅ Tomt svar från server
- ✅ Ogiltigt JSON-svar

## Commits
```
6013e55 - Fix: Förbättra JSON-hantering och sanitering i auth API:er - fixa registreringsproblem
b76ab1b - Fix: Robust JSON-hantering i AuthContext och rate limiting i auth API:er
```

## Nästa steg
1. ✅ Testa registrering lokalt
2. ✅ Testa på Vercel efter deployment
3. ✅ Verifiera att alla felmeddelanden visas korrekt
4. ✅ Kontrollera att demo-läget fortfarande fungerar

## Säkerhetsförbättringar
- ✅ XSS-skydd bibehållet med DOMPurify
- ✅ Input-validering med Zod
- ✅ Rate limiting på plats med korrekt felhantering
- ✅ Bättre felhantering utan att läcka känslig information
- ✅ Robust JSON-parsing som förhindrar crashes
