-- Korrekt Admin-Konfiguration för Aurelia Market
-- Kör detta i Turso CLI: turso db shell dostar < database/setup-correct-admin.sql

-- 1. Ta bort alla gamla test-användare
DELETE FROM users WHERE email LIKE '%@example.com';
DELETE FROM users WHERE email LIKE '%@aurelia-market.se';
DELETE FROM users WHERE email LIKE '%@demo.com';

-- 2. Ta bort eventuell gammal admin med fel email
DELETE FROM users WHERE email = 'ngabulokana75@gmail.com';

-- 3. Skapa rätt admin-användare
-- Email: ngabulokana@gmail.com
-- Lösenord: a-z, A-Z, 0-9
-- Hash genererad med bcrypt (10 rounds)
INSERT OR REPLACE INTO users (id, email, password_hash, role, created_at, updated_at)
VALUES (
  'admin-1767773607501',
  'ngabulokana@gmail.com',
  '$2a$10$MbdGuGhBo0B5bcQgWQbkr.lui7J/spf8wkX45peMO3XmCS0Vc7CBS',
  'admin',
  datetime('now'),
  datetime('now')
);

-- 4. Verifiera att admin skapades korrekt
SELECT 'Admin-användare skapad:' as status;
SELECT email, role, created_at FROM users WHERE email = 'ngabulokana@gmail.com';

-- 5. Visa alla användare
SELECT 'Alla användare i databasen:' as status;
SELECT email, role FROM users ORDER BY role DESC, email ASC;
