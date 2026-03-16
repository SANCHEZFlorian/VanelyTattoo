-- Add duration column to flash_tattoos table
ALTER TABLE public.flash_tattoos
ADD COLUMN IF NOT EXISTS duration integer DEFAULT 60;

-- Add booking_end_time column to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS booking_end_time time;
