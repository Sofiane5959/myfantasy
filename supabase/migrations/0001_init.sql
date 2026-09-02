-- MyFantasy — schéma initial + RLS
-- À exécuter dans Supabase → SQL Editor (ou `supabase db push`).
-- Idempotent : ré-exécutable sans dommage.

-- =====================================================================
-- 1. TABLES
-- =====================================================================

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text        not null check (char_length(display_name) between 1 and 40),
  birthdate     date        not null check (birthdate > '1900-01-01'),
  role          text        not null check (role in ('Dominante','Soumise','Switch','Égalitaire','Sans rôle défini')),
  intensity     text        not null check (intensity in ('Curieuse','Ouverte','Assumée','Experte')),
  categories    text[]      not null default '{}' check (array_length(categories, 1) between 1 and 12),
  seeking       text[]      not null default '{}',
  note          text        check (char_length(note) <= 280),
  avatar_color  text        not null default '#C4427E' check (avatar_color ~ '^#[0-9A-Fa-f]{6}$'),
  verified      boolean     not null default false,
  -- « Tu es invisible par défaut » : c'est maintenant vrai, au niveau de la base.
  is_visible    boolean     not null default false,
  last_seen_at  timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Limites dures : jamais lisibles par personne d'autre que la propriétaire,
-- même après un match mutuel.
create table if not exists public.profile_private (
  user_id     uuid primary key references public.profiles(id) on delete cascade,
  hard_limits text[] not null default '{}',
  updated_at  timestamptz not null default now()
);

create table if not exists public.passes (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  target_id  uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, target_id),
  constraint passes_not_self check (user_id <> target_id)
);

create table if not exists public.invitations (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references public.profiles(id) on delete cascade,
  receiver_id  uuid not null references public.profiles(id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at   timestamptz not null default now(),
  responded_at timestamptz,
  constraint invitations_not_self check (sender_id <> receiver_id),
  unique (sender_id, receiver_id)
);

-- Paire canonique : user_a < user_b, donc un seul match possible par duo.
create table if not exists public.matches (
  id         uuid primary key default gen_random_uuid(),
  user_a     uuid not null references public.profiles(id) on delete cascade,
  user_b     uuid not null references public.profiles(id) on delete cascade,
  safe_word  text not null default 'Velvet' check (char_length(safe_word) between 1 and 40),
  created_at timestamptz not null default now(),
  constraint matches_ordered check (user_a < user_b),
  unique (user_a, user_b)
);

create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null references public.matches(id) on delete cascade,
  sender_id  uuid not null references public.profiles(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists messages_match_created_idx on public.messages (match_id, created_at);
create index if not exists invitations_receiver_idx    on public.invitations (receiver_id, status);
create index if not exists profiles_visible_idx        on public.profiles (is_visible) where is_visible;

-- =====================================================================
-- 2. HELPERS
-- =====================================================================

create or replace function public.is_adult(bd date)
returns boolean language sql stable as $fn$
  select bd <= (current_date - interval '18 years')::date;
$fn$;

-- security definer : contourne la RLS de `matches` pour éviter une récursion
-- entre la policy de `profiles` et celle de `matches`.
create or replace function public.is_matched(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public as $fn$
  select exists (
    select 1 from public.matches m
    where m.user_a = least(a, b) and m.user_b = greatest(a, b)
  );
$fn$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $fn$
begin
  new.updated_at := now();
  return new;
end;
$fn$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- =====================================================================
-- 3. SCORING — remplace les 85/94/88 codés en dur du prototype
-- =====================================================================

create or replace function public.role_compatibility(r1 text, r2 text)
returns int language sql immutable as $fn$
  select case
    when r1 = 'Sans rôle défini' or r2 = 'Sans rôle défini' then 60
    when (r1 = 'Dominante' and r2 = 'Soumise') or (r1 = 'Soumise' and r2 = 'Dominante') then 100
    when r1 = 'Égalitaire' and r2 = 'Égalitaire' then 95
    when r1 = 'Switch' or r2 = 'Switch' then 85
    when r1 = r2 then 45          -- deux Dominantes, deux Soumises : friction
    else 65
  end;
$fn$;

create or replace function public.intensity_rank(i text)
returns int language sql immutable as $fn$
  select case i
    when 'Curieuse' then 0 when 'Ouverte' then 1
    when 'Assumée'  then 2 when 'Experte' then 3 else 0 end;
$fn$;

create or replace function public.intensity_compatibility(i1 text, i2 text)
returns int language sql immutable as $fn$
  select greatest(0, 100 - abs(public.intensity_rank(i1) - public.intensity_rank(i2)) * 22);
$fn$;

-- Jaccard sur les catégories : intersection / union.
create or replace function public.category_compatibility(c1 text[], c2 text[])
returns int language sql immutable as $fn$
  select case
    when cardinality(c1) = 0 or cardinality(c2) = 0 then 0
    else round(
      100.0 * cardinality(array(select unnest(c1) intersect select unnest(c2)))
            / nullif(cardinality(array(select unnest(c1) union select unnest(c2))), 0)
    )::int
  end;
$fn$;

-- =====================================================================
-- 4. RLS
-- =====================================================================

alter table public.profiles        enable row level security;
alter table public.profile_private enable row level security;
alter table public.passes          enable row level security;
alter table public.invitations     enable row level security;
alter table public.matches         enable row level security;
alter table public.messages        enable row level security;

-- ---- profiles ----
-- Lecture de la ligne complète (display_name compris) UNIQUEMENT sur soi-même
-- ou après match mutuel. La découverte passe par discovery_feed(), qui ne
-- renvoie jamais le nom. C'est le vrai remplacement du `blur(6px)` CSS.
drop policy if exists profiles_select_self_or_matched on public.profiles;
create policy profiles_select_self_or_matched on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_matched(auth.uid(), id));

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert to authenticated with check (id = auth.uid() and public.is_adult(birthdate));

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid() and public.is_adult(birthdate));

drop policy if exists profiles_delete_self on public.profiles;
create policy profiles_delete_self on public.profiles
  for delete to authenticated using (id = auth.uid());

-- ---- profile_private (limites dures) ----
drop policy if exists profile_private_owner on public.profile_private;
create policy profile_private_owner on public.profile_private
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---- passes ----
drop policy if exists passes_owner on public.passes;
create policy passes_owner on public.passes
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---- invitations ----
drop policy if exists invitations_select_party on public.invitations;
create policy invitations_select_party on public.invitations
  for select to authenticated
  using (sender_id = auth.uid() or receiver_id = auth.uid());

drop policy if exists invitations_insert_sender on public.invitations;
create policy invitations_insert_sender on public.invitations
  for insert to authenticated with check (sender_id = auth.uid());

-- Seule la destinataire répond, et seulement à une invitation en attente.
drop policy if exists invitations_update_receiver on public.invitations;
create policy invitations_update_receiver on public.invitations
  for update to authenticated
  using (receiver_id = auth.uid() and status = 'pending')
  with check (receiver_id = auth.uid());

-- ---- matches ----
drop policy if exists matches_select_party on public.matches;
create policy matches_select_party on public.matches
  for select to authenticated
  using (user_a = auth.uid() or user_b = auth.uid());

-- Les matchs sont créés par le trigger (security definer), jamais par le client.
drop policy if exists matches_update_party on public.matches;
create policy matches_update_party on public.matches
  for update to authenticated
  using (user_a = auth.uid() or user_b = auth.uid())
  with check (user_a = auth.uid() or user_b = auth.uid());

-- ---- messages ----
drop policy if exists messages_select_party on public.messages;
create policy messages_select_party on public.messages
  for select to authenticated
  using (exists (
    select 1 from public.matches m
    where m.id = messages.match_id and (m.user_a = auth.uid() or m.user_b = auth.uid())
  ));

drop policy if exists messages_insert_party on public.messages;
create policy messages_insert_party on public.messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = messages.match_id and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  );

-- =====================================================================
-- 5. TRIGGER : invitation acceptée → match
-- =====================================================================

create or replace function public.on_invitation_accepted()
returns trigger language plpgsql security definer set search_path = public as $fn$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    new.responded_at := now();
    insert into public.matches (user_a, user_b)
    values (least(new.sender_id, new.receiver_id), greatest(new.sender_id, new.receiver_id))
    on conflict (user_a, user_b) do nothing;
  elsif new.status = 'declined' and old.status is distinct from 'declined' then
    new.responded_at := now();
  end if;
  return new;
end;
$fn$;

drop trigger if exists invitations_accepted on public.invitations;
create trigger invitations_accepted before update on public.invitations
  for each row execute function public.on_invitation_accepted();

-- =====================================================================
-- 6. DISCOVERY FEED
-- Ne renvoie JAMAIS display_name. Les scores sont calculés en base à partir
-- du profil de l'appelante, pas inventés côté client.
-- =====================================================================

create or replace function public.discovery_feed(limit_count int default 20)
returns table (
  id                uuid,
  age               int,
  role              text,
  intensity         text,
  categories        text[],
  shared_categories text[],
  note              text,
  avatar_color      text,
  verified          boolean,
  online            boolean,
  score             int,
  score_intensity   int,
  score_role        int,
  score_categories  int
)
language sql stable security definer set search_path = public as $fn$
  with me as (
    select * from public.profiles where id = auth.uid()
  )
  select
    p.id,
    extract(year from age(p.birthdate))::int                     as age,
    p.role,
    p.intensity,
    p.categories,
    array(select unnest(p.categories) intersect select unnest(me.categories)) as shared_categories,
    p.note,
    p.avatar_color,
    p.verified,
    (p.last_seen_at > now() - interval '5 minutes')              as online,
    round(
        0.50 * public.category_compatibility(me.categories, p.categories)
      + 0.30 * public.role_compatibility(me.role, p.role)
      + 0.20 * public.intensity_compatibility(me.intensity, p.intensity)
    )::int                                                       as score,
    public.intensity_compatibility(me.intensity, p.intensity)    as score_intensity,
    public.role_compatibility(me.role, p.role)                   as score_role,
    public.category_compatibility(me.categories, p.categories)   as score_categories
  from public.profiles p, me
  where p.id <> me.id
    and p.is_visible
    and not exists (select 1 from public.passes      x where x.user_id = me.id and x.target_id = p.id)
    and not exists (select 1 from public.invitations i where i.sender_id = me.id and i.receiver_id = p.id)
    and not public.is_matched(me.id, p.id)
  order by score desc, p.created_at desc
  limit greatest(1, least(limit_count, 50));
$fn$;

-- =====================================================================
-- 7. RPC d'écriture
-- =====================================================================

create or replace function public.upsert_my_profile(
  p_display_name text,
  p_birthdate    date,
  p_role         text,
  p_intensity    text,
  p_categories   text[],
  p_seeking      text[],
  p_hard_limits  text[] default '{}',
  p_note         text default null,
  p_is_visible   boolean default false
) returns uuid
language plpgsql security definer set search_path = public as $fn$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if not public.is_adult(p_birthdate) then
    raise exception 'Tu dois avoir 18 ans ou plus.' using errcode = '23514';
  end if;

  insert into public.profiles (id, display_name, birthdate, role, intensity, categories, seeking, note, is_visible)
  values (uid, p_display_name, p_birthdate, p_role, p_intensity, p_categories, p_seeking, p_note, p_is_visible)
  on conflict (id) do update set
    display_name = excluded.display_name,
    birthdate    = excluded.birthdate,
    role         = excluded.role,
    intensity    = excluded.intensity,
    categories   = excluded.categories,
    seeking      = excluded.seeking,
    note         = excluded.note,
    is_visible   = excluded.is_visible;

  insert into public.profile_private (user_id, hard_limits)
  values (uid, p_hard_limits)
  on conflict (user_id) do update set hard_limits = excluded.hard_limits, updated_at = now();

  return uid;
end;
$fn$;

create or replace function public.send_invitation(p_target uuid)
returns uuid
language plpgsql security definer set search_path = public as $fn$
declare
  uid uuid := auth.uid();
  inv uuid;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if uid = p_target then
    raise exception 'Impossible de s inviter soi-même.';
  end if;
  if not exists (select 1 from public.profiles where id = p_target and is_visible) then
    raise exception 'Profil introuvable.';
  end if;

  -- Si la cible nous avait déjà invitée, on accepte : match immédiat.
  update public.invitations
     set status = 'accepted'
   where sender_id = p_target and receiver_id = uid and status = 'pending'
  returning id into inv;

  if inv is not null then
    return inv;
  end if;

  insert into public.invitations (sender_id, receiver_id)
  values (uid, p_target)
  on conflict (sender_id, receiver_id) do nothing
  returning id into inv;

  return inv;
end;
$fn$;

create or replace function public.touch_last_seen()
returns void language sql security definer set search_path = public as $fn$
  update public.profiles set last_seen_at = now() where id = auth.uid();
$fn$;

-- =====================================================================
-- 8. GRANTS — le rôle anon n'a accès à rien.
-- =====================================================================

revoke all on all tables    in schema public from anon;
revoke all on all functions in schema public from anon;

grant execute on function public.discovery_feed(int)   to authenticated;
grant execute on function public.send_invitation(uuid) to authenticated;
grant execute on function public.touch_last_seen()     to authenticated;
grant execute on function public.upsert_my_profile(text, date, text, text, text[], text[], text[], text, boolean) to authenticated;

-- =====================================================================
-- 9. REALTIME — nécessaire pour la messagerie en direct.
-- =====================================================================

do $do$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end
$do$;
