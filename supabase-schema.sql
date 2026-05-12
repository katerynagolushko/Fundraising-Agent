-- Supabase Setup for Fundraising Agent
-- Run this SQL in your Supabase SQL Editor

-- Profiles table
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  sector text not null,
  stage text not null,
  round_size text,
  model text,
  geography text[],
  problem text,
  solution text,
  why_now text,
  traction text,
  warm_connections text,
  created_at timestamptz default now()
);

-- Founders table
create table if not exists founders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles on delete cascade,
  name text not null,
  background text,
  linkedin text
);

-- Investors table
create table if not exists investors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles on delete cascade,
  name text not null,
  fund text,
  type text not null,
  sectors text[],
  stage text,
  check_size text,
  path text,
  mutual text,
  email text,
  linkedin text,
  twitter text,
  approach text,
  cold_message text,
  signals text[],
  flag text,
  apply_url text,
  deadline text,
  accelerator_note text,
  status text default 'Untouched',
  rank int,
  created_at timestamptz default now()
);

-- Sent emails table
create table if not exists sent_emails (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors on delete cascade,
  sent_at timestamptz default now(),
  subject text,
  body text,
  gmail_message_id text,
  opened boolean default false
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table founders enable row level security;
alter table investors enable row level security;
alter table sent_emails enable row level security;

-- RLS Policies for profiles
create policy "Users can view own profiles"
  on profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profiles"
  on profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profiles"
  on profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete own profiles"
  on profiles for delete
  using (auth.uid() = user_id);

-- RLS Policies for founders
create policy "Users can view own founders"
  on founders for select
  using (profile_id in (select id from profiles where user_id = auth.uid()));

create policy "Users can insert own founders"
  on founders for insert
  with check (profile_id in (select id from profiles where user_id = auth.uid()));

-- RLS Policies for investors
create policy "Users can view own investors"
  on investors for select
  using (profile_id in (select id from profiles where user_id = auth.uid()));

create policy "Users can insert own investors"
  on investors for insert
  with check (profile_id in (select id from profiles where user_id = auth.uid()));

create policy "Users can update own investors"
  on investors for update
  using (profile_id in (select id from profiles where user_id = auth.uid()));

-- RLS Policies for sent_emails
create policy "Users can view own sent emails"
  on sent_emails for select
  using (investor_id in (
    select id from investors where profile_id in (
      select id from profiles where user_id = auth.uid()
    )
  ));

create policy "Users can insert own sent emails"
  on sent_emails for insert
  with check (investor_id in (
    select id from investors where profile_id in (
      select id from profiles where user_id = auth.uid()
    )
  ));

-- Indexes for better performance
create index if not exists profiles_user_id_idx on profiles(user_id);
create index if not exists founders_profile_id_idx on founders(profile_id);
create index if not exists investors_profile_id_idx on investors(profile_id);
create index if not exists sent_emails_investor_id_idx on sent_emails(investor_id);
