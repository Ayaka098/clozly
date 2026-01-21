create table if not exists cache (
  key text primary key,
  payload jsonb not null,
  expires_at timestamptz
);

create index if not exists cache_expires_at_idx on cache (expires_at);
