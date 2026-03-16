-- Migration: Add is_featured to flash_tattoos and price to bookings

ALTER TABLE flash_tattoos ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
