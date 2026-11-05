begin;

alter table public.profiles
  add column language text not null default 'en'
  constraint profiles_language_supported check (language in ('en','hi'));

-- Existing profile RLS permits each user to update only their own row.
-- Keep this a column grant so identity and other protected fields stay locked.
grant update(language) on public.profiles to authenticated;

notify pgrst, 'reload schema';
commit;
