-- Ajout de données factices pour tester l'application VanelyTattoo
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Flash Tattoos (50+ items)
INSERT INTO public.flash_tattoos (title, categories, size, price, original_price, status, images, description, color)
SELECT
  (ARRAY['Dragon Mystique', 'Rose Noire', 'Crâne Ancien', 'Serpent Sinueux', 'Dague Tranchante', 'Loup Solitaire', 'Papillon Lunaire', 'Samourai', 'Geisha', 'Fleur de Lotus'])[1 + (i % 10)] || ' #' || i,
  CASE
    WHEN i % 4 = 0 THEN ARRAY['Anime', 'Color']
    WHEN i % 4 = 1 THEN ARRAY['Blackwork', 'Dark']
    WHEN i % 4 = 2 THEN ARRAY['Nature', 'Floral']
    ELSE ARRAY['Traditional', 'Old School']
  END,
  (ARRAY['10cm', '15cm', '20cm', '5x5cm', 'Dos Complet'])[1 + (i % 5)],
  100 + (i * 5),
  150 + (i * 5),
  'active',
  CASE
    WHEN i % 5 = 0 THEN ARRAY['/images/flash_pikachu.png']
    WHEN i % 5 = 1 THEN ARRAY['/images/flash_sailormoon.png']
    WHEN i % 5 = 2 THEN ARRAY['/images/flash_skull.png']
    WHEN i % 5 = 3 THEN ARRAY['/images/flash_zelda.png']
    ELSE ARRAY['/images/generic_flash.png']
  END,
  'Un tatouage magnifique et unique, réalisé avec soin. Idéal pour les amateurs de style ' || (CASE WHEN i % 2 = 0 THEN 'Japonais' ELSE 'Old School' END) || '. Disponible immédiatement.',
  CASE WHEN i % 2 = 0 THEN 'Color' ELSE 'Black & Grey' END
FROM generate_series(1, 50) as t(i);

-- 2. Gallery Items (50+ items)
INSERT INTO public.gallery_items (title, images, categories, status, description)
SELECT
  'Réalisation ' || (ARRAY['Dos Complet', 'Bras Japonais', 'Petite Pièce', 'Portrait Réaliste', 'Grosse Pièce', 'Cover Up'])[1 + (i % 6)] || ' ' || i,
  CASE
    WHEN i % 4 = 0 THEN ARRAY['/images/gallery_dragonball.png']
    WHEN i % 4 = 1 THEN ARRAY['/images/gallery_eevee.png']
    WHEN i % 4 = 2 THEN ARRAY['/images/gallery_kitsune.png']
    ELSE ARRAY['/images/generic_tattoo.png']
  END,
  CASE WHEN i % 2 = 0 THEN ARRAY['Realism', 'Blackwork'] ELSE ARRAY['Anime', 'Color'] END,
  'active',
  'Séance réalisée en ' || (4 + (i % 5)) || ' heures. Client très satisfait du résultat. Encre vegan utilisée.'
FROM generate_series(1, 50) as t(i);

-- 3. Bookings (50+ items)
INSERT INTO public.bookings (client_name, email, booking_date, booking_time, project_type, description, status)
SELECT
  (ARRAY['Jean Dupont', 'Marie Curie', 'Pierre Martin', 'Sophie Bernard', 'Lucas Dubreuil', 'Emma Petit', 'Thomas Richard', 'Lea Durand', 'Nicolas Moreau', 'Julie Simon'])[1 + (i % 10)],
  'client' || i || '@example.com',
  CURRENT_DATE + (i || ' days')::interval,
  '14:00:00',
  (ARRAY['Flash', 'Custom', 'Retouches'])[1 + (i % 3)],
  'Je voudrais réserver pour un projet de type ' || (CASE WHEN i % 2 = 0 THEN 'Dragon' ELSE 'Fleur' END),
  CASE WHEN i % 5 = 0 THEN 'completed' WHEN i % 5 = 1 THEN 'confirmed' ELSE 'pending' END
FROM generate_series(1, 50) as t(i);

-- 4. Booking Exceptions (50+ items)
INSERT INTO public.booking_exceptions (exception_date, exception_time, status)
SELECT
  CURRENT_DATE + ((i + 100) || ' days')::interval,
  '10:00:00',
  'blocked'
FROM generate_series(1, 50) as t(i);

-- 5. Messages (50+ items)
INSERT INTO public.messages (from_name, email, subject, message_body, is_read)
SELECT
  'Visiteur ' || i,
  'visiteur' || i || '@test.com',
  'Question sur le tatouage ' || i,
  'Bonjour, je voudrais savoir si le flash #' || i || ' est toujours disponible ou si je peux le modifier légèrement. Merci d''avance.',
  CASE WHEN i % 2 = 0 THEN true ELSE false END
FROM generate_series(1, 50) as t(i);

-- 6. Blog Posts (50+ items)
INSERT INTO public.blog_posts (title, content, publish_date, status, views)
SELECT
  'Article Blog: Les tendances du tatouage ' || (2020 + (i % 6)),
  'Contenu de l''article sur les tatouages numéro ' || i || '. Voici pourquoi le style ' || (CASE WHEN i % 2 = 0 THEN 'Old School' ELSE 'Neotrad' END) || ' revient à la mode...' || repeat('texte de remplissage ', 10),
  CURRENT_DATE - (i || ' days')::interval,
  'published',
  i * 10
FROM generate_series(1, 50) as t(i);

-- 7. Banners (50+ items)
INSERT INTO public.banners (image_url, title, description, button_text, button_link, active, display_order)
SELECT
  (ARRAY['/images/hero_1.png', '/images/hero_2.png', '/images/hero_3.png', '/images/default_banner.png'])[1 + (i % 4)],
  'Bannière Promo ' || i,
  'Découvrez nos offres spéciales ' || i || ' sur toute la boutique !',
  'Voir Plus',
  '/flash',
  CASE WHEN i < 5 THEN true ELSE false END,
  i
FROM generate_series(1, 50) as t(i);

-- 8. Promotions (50+ items)
INSERT INTO public.promotions (name, discount_percent, active, start_date, end_date, is_global)
SELECT
  'Promo Saison ' || i,
  10 + (i % 40),
  CASE WHEN i % 5 = 0 THEN true ELSE false END,
  CURRENT_DATE,
  CURRENT_DATE + '30 days'::interval,
  CASE WHEN i % 2 = 0 THEN true ELSE false END
FROM generate_series(1, 50) as t(i);

-- 9. Profiles (50+ items)
INSERT INTO public.profiles (email, role)
SELECT
  'admin' || i || '@vanely.com',
  'admin'
FROM generate_series(1, 50) as t(i);
