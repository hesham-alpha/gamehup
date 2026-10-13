-- Run this once in Supabase Dashboard > SQL Editor.
begin;

create table if not exists public.wishlist (
  user_id uuid not null references auth.users (id) on delete cascade,
  game_id integer not null check (game_id > 0),
  created_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

create index if not exists wishlist_user_created_at_idx
  on public.wishlist (user_id, created_at desc);

alter table public.wishlist enable row level security;

revoke all on table public.wishlist from anon, authenticated;
grant select, insert, delete on table public.wishlist to authenticated;

drop policy if exists "Users can view their own wishlist" on public.wishlist;
create policy "Users can view their own wishlist"
  on public.wishlist for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can add to their own wishlist" on public.wishlist;
create policy "Users can add to their own wishlist"
  on public.wishlist for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can remove from their own wishlist" on public.wishlist;
create policy "Users can remove from their own wishlist"
  on public.wishlist for delete to authenticated
  using ((select auth.uid()) = user_id);

commit;
