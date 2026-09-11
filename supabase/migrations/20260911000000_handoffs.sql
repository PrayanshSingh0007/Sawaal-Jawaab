-- Sawaal Jawaab — carrying a reply back to the person who asked.
--
-- Two things shape this schema.
--
-- The question never arrives here. It travels inside the QR link and nowhere
-- else, so the server cannot know what anyone asked — which matters, because
-- these are questions asked in hospitals and police stations. A row exists
-- only to catch a reply.
--
-- There is no sign-in anywhere in this product, so the handoff id IS the
-- capability: holding it is what proves you were shown the code. That makes
-- enumeration the whole threat model. The table therefore has row level
-- security on with NO policies at all — `anon` cannot read or write a single
-- row directly, and `select *` returns nothing. Every operation goes through a
-- security-definer function that demands the exact id.

create table if not exists public.handoffs (
  id          text primary key,
  reply       text,
  suggestion  text,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null,

  constraint handoffs_id_shape      check (id ~ '^[a-z0-9]{8,32}$'),
  constraint handoffs_reply_len     check (reply is null or char_length(reply) <= 2000),
  constraint handoffs_suggest_len   check (suggestion is null or char_length(suggestion) <= 2000)
);

create index if not exists handoffs_expires_at_idx on public.handoffs (expires_at);

-- On with no policies: the table is unreachable except through the functions.
alter table public.handoffs enable row level security;

revoke all on public.handoffs from anon, authenticated;

-- One hour, matching the expiry the interface promises the person.
create or replace function public.sj_ttl() returns interval
language sql immutable as $$ select interval '60 minutes' $$;

/* Opens a handoff, and takes the opportunity to sweep away expired ones so the
   table stays small without a scheduled job. */
create or replace function public.open_handoff(p_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.handoffs where expires_at < now() - interval '1 day';

  insert into public.handoffs (id, expires_at)
  values (p_id, now() + public.sj_ttl())
  on conflict (id) do nothing;
end;
$$;

/* The person who scanned the code answers. Overwriting is allowed while the
   handoff is alive, because "Change the reply" is a thing people need. */
create or replace function public.post_reply(p_id text, p_reply text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  hit boolean;
begin
  update public.handoffs
     set reply = p_reply
   where id = p_id
     and expires_at > now()
  returning true into hit;

  return coalesce(hit, false);
end;
$$;

/* A family helper suggests better words. Same rules. */
create or replace function public.post_suggestion(p_id text, p_suggestion text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  hit boolean;
begin
  update public.handoffs
     set suggestion = p_suggestion
   where id = p_id
     and expires_at > now()
  returning true into hit;

  return coalesce(hit, false);
end;
$$;

/* The asker's phone checks whether anything has come back. Returns only what
   was written to it — there is nothing else here to return. */
create or replace function public.read_handoff(p_id text)
returns table (reply text, suggestion text)
language sql
security definer
set search_path = public
as $$
  select h.reply, h.suggestion
    from public.handoffs h
   where h.id = p_id
     and h.expires_at > now();
$$;

revoke all on function public.open_handoff(text)            from public;
revoke all on function public.post_reply(text, text)        from public;
revoke all on function public.post_suggestion(text, text)   from public;
revoke all on function public.read_handoff(text)            from public;

grant execute on function public.open_handoff(text)          to anon, authenticated;
grant execute on function public.post_reply(text, text)      to anon, authenticated;
grant execute on function public.post_suggestion(text, text) to anon, authenticated;
grant execute on function public.read_handoff(text)          to anon, authenticated;
