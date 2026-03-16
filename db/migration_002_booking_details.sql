-- Migration pour ajouter les nouveaux champs de réservation
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS size text,
ADD COLUMN IF NOT EXISTS placement text,
ADD COLUMN IF NOT EXISTS budget text;

COMMENT ON COLUMN public.bookings.size IS 'Taille approximative du tatouage';
COMMENT ON COLUMN public.bookings.placement IS 'Emplacement sur le corps';
COMMENT ON COLUMN public.bookings.budget IS 'Fourchette de budget sélectionnée';
