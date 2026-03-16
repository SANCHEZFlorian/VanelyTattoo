-- Migration script to add event support to booking_exceptions

-- 1. Add title and description columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='booking_exceptions' AND column_name='title') THEN
        ALTER TABLE public.booking_exceptions ADD COLUMN title text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='booking_exceptions' AND column_name='description') THEN
        ALTER TABLE public.booking_exceptions ADD COLUMN description text;
    END IF;
END $$;

-- 2. Update RLS Policy
DROP POLICY IF EXISTS "Enable all access for all users" ON public.booking_exceptions;
CREATE POLICY "Enable all access for all users" ON public.booking_exceptions FOR ALL USING (true) WITH CHECK (true);
