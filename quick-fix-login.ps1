# Quick Fix för Login-Problem
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔧 QUICK FIX - LOGIN PROBLEM" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Steg 1: Kontrollera .env.local
Write-Host "📋 Steg 1: Kontrollerar .env.local..." -ForegroundColor Yellow

if (Test-Path ".env.local") {
    Write-Host "✅ .env.local finns" -ForegroundColor Green
    
    $envContent = Get-Content ".env.local" -Raw
    
    # Kontrollera viktiga variabler
    if ($envContent -match "DEMO_MODE=false") {
        Write-Host "✅ DEMO_MODE=false (använder riktig databas)" -ForegroundColor Green
    } elseif ($envContent -match "DEMO_MODE=true") {
        Write-Host "⚠️  DEMO_MODE=true (använder mock-data)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ DEMO_MODE saknas!" -ForegroundColor Red
    }
    
    if ($envContent -match "TURSO_DATABASE_URL=") {
        Write-Host "✅ TURSO_DATABASE_URL finns" -ForegroundColor Green
    } else {
        Write-Host "❌ TURSO_DATABASE_URL saknas!" -ForegroundColor Red
    }
    
    if ($envContent -match "TURSO_AUTH_TOKEN=") {
        Write-Host "✅ TURSO_AUTH_TOKEN finns" -ForegroundColor Green
    } else {
        Write-Host "❌ TURSO_AUTH_TOKEN saknas!" -ForegroundColor Red
    }
    
    if ($envContent -match "JWT_SECRET=") {
        Write-Host "✅ JWT_SECRET finns" -ForegroundColor Green
    } else {
        Write-Host "❌ JWT_SECRET saknas!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ .env.local saknas!" -ForegroundColor Red
    Write-Host "   Kopierar från .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ .env.local skapad - REDIGERA DEN MED DINA NYCKLAR!" -ForegroundColor Green
}

Write-Host ""

# Steg 2: Rensa cache
Write-Host "📋 Steg 2: Rensar Next.js cache..." -ForegroundColor Yellow

if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ Cache rensad" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Ingen cache att rensa" -ForegroundColor Gray
}

Write-Host ""

# Steg 3: Testa login
Write-Host "📋 Steg 3: Testar login..." -ForegroundColor Yellow
Write-Host "⚠️  VIKTIGT: Servern måste köras (npm run dev) för att detta ska fungera!" -ForegroundColor Yellow
Write-Host ""

$response = Read-Host "Kör servern redan? (j/n)"

if ($response -eq "j" -or $response -eq "J") {
    Write-Host "Testar login..." -ForegroundColor Yellow
    node test-login-http.js
} else {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "📝 NÄSTA STEG:" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Öppna en NY terminal" -ForegroundColor White
    Write-Host "2. Kör: npm run dev" -ForegroundColor White
    Write-Host "3. Vänta tills servern startat" -ForegroundColor White
    Write-Host "4. Kör detta script igen: .\quick-fix-login.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "ELLER testa direkt i webbläsaren:" -ForegroundColor White
    Write-Host "1. Gå till: http://localhost:3000/login" -ForegroundColor White
    Write-Host "2. Logga in med: test@example.com / test123456" -ForegroundColor White
    Write-Host "3. Öppna F12 och kolla Console för felmeddelanden" -ForegroundColor White
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ QUICK FIX KLAR!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
