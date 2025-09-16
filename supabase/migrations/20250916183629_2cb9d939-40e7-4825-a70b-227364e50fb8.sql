-- Create public storage bucket for EPUBs
insert into storage.buckets (id, name, public)
values ('epubs', 'epubs', true)
on conflict (id) do nothing;

-- Policies for storage.objects limited to bucket 'epubs'
-- Public read for EPUB files
create policy if not exists "Public can read epubs"
  on storage.objects
  for select
  using (bucket_id = 'epubs');

-- Only admins can insert/update/delete in epubs bucket
create policy if not exists "Admins can manage epubs"
  on storage.objects
  for all
  using (bucket_id = 'epubs' and public.user_has_role(auth.uid(), 'admin'::public.app_role))
  with check (bucket_id = 'epubs' and public.user_has_role(auth.uid(), 'admin'::public.app_role));