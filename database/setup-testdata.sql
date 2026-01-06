-- Setup script för Aurelia Market
-- Kör detta EFTER att du har kört schema.sql

-- Lägg till testprodukter
INSERT INTO products (name, description, price, image, stock, active) VALUES
('Lyxig Guldarmband', 'Handgjort guldarmband i 18K guld med elegant design. Perfekt för speciella tillfällen.', 12999, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500', 5, true),
('Diamantring', 'Vacker diamantring med 0.5 karat diamant i vitguld. Tidlös elegans.', 24999, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500', 3, true),
('Pärla Halsband', 'Elegant pärla halsband med vita sötvattenpärlor. Klassisk skönhet.', 8999, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500', 8, true),
('Guldörhängen', 'Klassiska guldörhängen i 14K guld. Passar till allt.', 5999, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500', 10, true),
('Silverarmband', 'Modernt silverarmband med minimalistisk design.', 3999, 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500', 15, true),
('Safirring', 'Blå safirring omgiven av diamanter. Exklusiv design.', 18999, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500', 2, true);

-- Skapa en testanvändare (lösenord: test1234)
-- OBS: Detta är ett exempel-hash. Du måste registrera en riktig användare via appen.
-- Eller använd bcrypt för att hasha lösenordet först.

-- För att skapa admin-användare:
-- 1. Registrera en vanlig användare via /register
-- 2. Kör sedan denna SQL för att göra användaren till admin:
-- UPDATE users SET role = 'admin' WHERE email = 'din-email@example.com';

-- Verifiera att allt är skapat
SELECT 'Produkter skapade:' as status, COUNT(*) as antal FROM products;
SELECT 'Användare:' as status, COUNT(*) as antal FROM users;
