-- Run this in Supabase SQL Editor to add the missing column
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS phone text;
