alter table profiles add column tutorials_seen text[] default '{}'::text[] not null;
