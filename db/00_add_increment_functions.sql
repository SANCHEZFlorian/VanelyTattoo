-- Function to increment flash views
create or replace function increment_flash_view(row_id bigint)
returns void
language plpgsql
security definer
as $$
begin
  update public.flash_tattoos
  set views = coalesce(views, 0) + 1
  where id = row_id;
end;
$$;

-- Function to increment gallery views
create or replace function increment_gallery_view(row_id bigint)
returns void
language plpgsql
security definer
as $$
begin
  update public.gallery_items
  set views = coalesce(views, 0) + 1
  where id = row_id;
end;
$$;
