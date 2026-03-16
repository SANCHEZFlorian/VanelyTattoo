-- Add display_order column to admin_notes if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'admin_notes' and column_name = 'display_order') then
    alter table public.admin_notes add column display_order integer default 0;
  end if;
end $$;
