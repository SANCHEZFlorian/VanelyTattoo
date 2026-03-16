-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admin_notes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  title text,
  content text,
  color text DEFAULT 'bg-yellow-200'::text,
  is_done boolean DEFAULT false,
  event_date date,
  display_order integer DEFAULT 0,
  CONSTRAINT admin_notes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.banners (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  image_url text NOT NULL,
  title text,
  description text,
  button_text text,
  button_link text,
  display_order integer DEFAULT 0,
  active boolean DEFAULT true,
  CONSTRAINT banners_pkey PRIMARY KEY (id)
);
CREATE TABLE public.blog_posts (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  title text NOT NULL,
  content text,
  publish_date date,
  status text DEFAULT 'draft'::text,
  views integer DEFAULT 0,
  CONSTRAINT blog_posts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.booking_exceptions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  exception_date date NOT NULL,
  exception_time time without time zone NOT NULL,
  status text NOT NULL,
  title text,
  description text,
  CONSTRAINT booking_exceptions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.bookings (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  client_name text NOT NULL,
  email text,
  booking_date date,
  booking_time time without time zone,
  project_type text,
  description text,
  status text DEFAULT 'pending'::text,
  notes text,
  reference_image text,
  booking_end_time time without time zone,
  size text,
  placement text,
  budget text,
  processed_for_gallery boolean DEFAULT false,
  CONSTRAINT bookings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  phone text,
  full_name text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT clients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.flash_tattoos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  title text NOT NULL,
  categories ARRAY DEFAULT '{}'::text[],
  size text,
  color text,
  price integer,
  original_price integer,
  discount integer DEFAULT 0,
  description text,
  images ARRAY DEFAULT '{}'::text[],
  status text DEFAULT 'active'::text,
  views integer DEFAULT 0,
  duration integer DEFAULT 60,
  CONSTRAINT flash_tattoos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gallery_items (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  title text NOT NULL,
  images ARRAY DEFAULT '{}'::text[],
  categories ARRAY DEFAULT '{}'::text[],
  status text DEFAULT 'active'::text,
  views integer DEFAULT 0,
  description text,
  CONSTRAINT gallery_items_pkey PRIMARY KEY (id)
);
CREATE TABLE public.logs (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  action_type text NOT NULL,
  table_name text,
  record_id text,
  user_id uuid,
  details jsonb,
  status text DEFAULT 'success'::text,
  CONSTRAINT logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.messages (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  from_name text,
  email text,
  subject text,
  message_body text,
  is_read boolean DEFAULT false,
  phone text,
  CONSTRAINT messages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role text DEFAULT 'admin'::text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  permissions jsonb DEFAULT '{}'::jsonb,
  avatar_url text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.promotions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  name text NOT NULL,
  discount_percent integer NOT NULL,
  start_date date,
  end_date date,
  active boolean DEFAULT false,
  is_global boolean DEFAULT true,
  CONSTRAINT promotions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.wishlists (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  client_id uuid NOT NULL,
  flash_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT wishlists_pkey PRIMARY KEY (id),
  CONSTRAINT wishlists_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT wishlists_flash_id_fkey FOREIGN KEY (flash_id) REFERENCES public.flash_tattoos(id)
);