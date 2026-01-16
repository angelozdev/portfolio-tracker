-- Enable RLS (Row Level Security) for all tables
-- This ensures that even if someone queries the API directly, they can only access their own data.

-- 1. Brokers Table
create table public.brokers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  icon text, -- URL or icon identifier
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.brokers enable row level security;

create policy "Users can view their own brokers" 
on public.brokers for select 
using (auth.uid() = user_id);

create policy "Users can insert their own brokers" 
on public.brokers for insert 
with check (auth.uid() = user_id);

create policy "Users can update their own brokers" 
on public.brokers for update 
using (auth.uid() = user_id);

create policy "Users can delete their own brokers" 
on public.brokers for delete 
using (auth.uid() = user_id);


-- 2. Assets Table (Includes target_percentage)
-- We enforce that 'type' must be either 'stock' or 'etf'
create table public.assets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  symbol text not null, -- e.g., 'AAPL', 'VTI'
  name text not null,
  type text check (type in ('stock', 'etf')) not null,
  target_percentage numeric(5,2) not null default 0, -- e.g., 10.50
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.assets enable row level security;

create policy "Users can view their own assets" 
on public.assets for select 
using (auth.uid() = user_id);

create policy "Users can insert their own assets" 
on public.assets for insert 
with check (auth.uid() = user_id);

create policy "Users can update their own assets" 
on public.assets for update 
using (auth.uid() = user_id);

create policy "Users can delete their own assets" 
on public.assets for delete 
using (auth.uid() = user_id);


-- 3. Holdings Table (Links Assets to Brokers)
create table public.holdings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null, -- Added for easier RLS and querying
  broker_id uuid references public.brokers on delete cascade not null,
  asset_id uuid references public.assets on delete cascade not null,
  shares numeric(12,4) not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.holdings enable row level security;

create policy "Users can view their own holdings" 
on public.holdings for select 
using (auth.uid() = user_id);

create policy "Users can insert their own holdings" 
on public.holdings for insert 
with check (auth.uid() = user_id);

create policy "Users can update their own holdings" 
on public.holdings for update 
using (auth.uid() = user_id);

create policy "Users can delete their own holdings" 
on public.holdings for delete 
using (auth.uid() = user_id);


-- SEED DATA GENERATOR
-- This function allows you to quickly populate the database with test data for the current user.
-- Usage: select generate_seed_data();

create or replace function generate_seed_data()
returns void as $$
declare
  curr_user_id uuid;
  broker_fidelity uuid;
  broker_ibkr uuid;
  asset_vti uuid;
  asset_vxus uuid;
  asset_bnd uuid;
  asset_aapl uuid;
begin
  -- Get the current user's ID
  select auth.uid() into curr_user_id;

  if curr_user_id is null then
    raise exception 'User is not authenticated';
  end if;

  -- 1. Create Brokers
  insert into public.brokers (user_id, name, icon)
  values (curr_user_id, 'Fidelity', 'shield')
  returning id into broker_fidelity;

  insert into public.brokers (user_id, name, icon)
  values (curr_user_id, 'Interactive Brokers', 'globe')
  returning id into broker_ibkr;

  -- 2. Create Assets with Target Allocations (Total: 100%)
  -- Strategy: Bogleheads 3-Fund Portfolio + Apple "Fun Money"
  
  -- VTI: Total Stock Market (Target: 50%)
  insert into public.assets (user_id, symbol, name, type, target_percentage)
  values (curr_user_id, 'VTI', 'Vanguard Total Stock Market', 'etf', 50.00)
  returning id into asset_vti;

  -- VXUS: Total Intl Stock (Target: 30%)
  insert into public.assets (user_id, symbol, name, type, target_percentage)
  values (curr_user_id, 'VXUS', 'Vanguard Total International Stock', 'etf', 30.00)
  returning id into asset_vxus;

  -- BND: Total Bond Market (Target: 10%)
  insert into public.assets (user_id, symbol, name, type, target_percentage)
  values (curr_user_id, 'BND', 'Vanguard Total Bond Market', 'etf', 10.00)
  returning id into asset_bnd;

  -- AAPL: Apple Inc. (Target: 10%)
  insert into public.assets (user_id, symbol, name, type, target_percentage)
  values (curr_user_id, 'AAPL', 'Apple Inc.', 'stock', 10.00)
  returning id into asset_aapl;


  -- 3. Create Holdings (Distribute assets across brokers)
  
  -- Fidelity holds most of the boring stuff
  insert into public.holdings (user_id, broker_id, asset_id, shares)
  values 
    (curr_user_id, broker_fidelity, asset_vti, 45), -- ~$10k
    (curr_user_id, broker_fidelity, asset_bnd, 120); -- ~$9k

  -- IBKR holds International + Speculative
  insert into public.holdings (user_id, broker_id, asset_id, shares)
  values 
    (curr_user_id, broker_ibkr, asset_vxus, 150), -- ~$9k
    (curr_user_id, broker_ibkr, asset_aapl, 15);  -- ~$2.5k (Underweight, needs buying to hit 10%)

end;
$$ language plpgsql;
