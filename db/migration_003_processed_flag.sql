-- Migration pour ajouter le flag de traitement pour la galerie
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS processed_for_gallery boolean DEFAULT false;

COMMENT ON COLUMN public.bookings.processed_for_gallery IS 'Indique si le rendez-vous a été traité (publié ou ignoré) pour le bilan du jour';
