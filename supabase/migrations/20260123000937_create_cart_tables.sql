-- STEP 1: Persistent Cart schema

-- carts: 1 active cart per user
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','CHECKED_OUT','ABANDONED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- cart_items: products inside the cart
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete restrict,
  size text not null default 'M' check (size in ('S','M','L','XL')),
  quantity int not null default 1 check (quantity >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_id, size)
);

-- Helpful indexes
create index if not exists idx_cart_items_cart_id on public.cart_items(cart_id);
create index if not exists idx_carts_user_id on public.carts(user_id);

-- Updated_at triggers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_carts_updated_at on public.carts;
create trigger trg_carts_updated_at
before update on public.carts
for each row execute function public.set_updated_at();

drop trigger if exists trg_cart_items_updated_at on public.cart_items;
create trigger trg_cart_items_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;

-- Policies: user can read/write only their own cart
drop policy if exists "carts_select_own" on public.carts;
create policy "carts_select_own"
on public.carts for select
using (auth.uid() = user_id);

drop policy if exists "carts_insert_own" on public.carts;
create policy "carts_insert_own"
on public.carts for insert
with check (auth.uid() = user_id);

drop policy if exists "carts_update_own" on public.carts;
create policy "carts_update_own"
on public.carts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "carts_delete_own" on public.carts;
create policy "carts_delete_own"
on public.carts for delete
using (auth.uid() = user_id);

-- cart_items policies (join through carts)
drop policy if exists "cart_items_select_own" on public.cart_items;
create policy "cart_items_select_own"
on public.cart_items for select
using (
  exists (
    select 1 from public.carts c
    where c.id = cart_items.cart_id
      and c.user_id = auth.uid()
  )
);

drop policy if exists "cart_items_insert_own" on public.cart_items;
create policy "cart_items_insert_own"
on public.cart_items for insert
with check (
  exists (
    select 1 from public.carts c
    where c.id = cart_items.cart_id
      and c.user_id = auth.uid()
  )
);

drop policy if exists "cart_items_update_own" on public.cart_items;
create policy "cart_items_update_own"
on public.cart_items for update
using (
  exists (
    select 1 from public.carts c
    where c.id = cart_items.cart_id
      and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.carts c
    where c.id = cart_items.cart_id
      and c.user_id = auth.uid()
  )
);

drop policy if exists "cart_items_delete_own" on public.cart_items;
create policy "cart_items_delete_own"
on public.cart_items for delete
using (
  exists (
    select 1 from public.carts c
    where c.id = cart_items.cart_id
      and c.user_id = auth.uid()
  )
);
