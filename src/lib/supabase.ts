import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DBVideo {
  id: string;
  title: string;
  description: string;
  skill_category: string;
  video_ipfs_hash: string;
  thumbnail_ipfs_hash: string | null;
  owner_address: string;
  is_verified_human: boolean;
  ip_id: string | null;
  tx_hash: string | null;
  license_type: string | null;
  license_terms: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface DBUser {
  id: string;
  wallet_address: string;
  world_id_nullifier: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Supabase SQL for creating tables (run this in Supabase SQL Editor):
/*
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  wallet_address text unique not null,
  world_id_nullifier text unique,
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Videos table
create table public.videos (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  skill_category text not null,
  video_ipfs_hash text not null,
  thumbnail_ipfs_hash text,
  owner_address text not null references public.users(wallet_address) on delete cascade,
  is_verified_human boolean default false,
  ip_id text,
  tx_hash text,
  license_type text,
  license_terms jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index videos_owner_address_idx on public.videos(owner_address);
create index videos_skill_category_idx on public.videos(skill_category);
create index videos_created_at_idx on public.videos(created_at desc);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.videos enable row level security;

-- RLS Policies for users table
create policy "Users can view all users" on public.users
  for select using (true);

create policy "Users can insert their own record" on public.users
  for insert with check (true);

create policy "Users can update their own record" on public.users
  for update using (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- RLS Policies for videos table
create policy "Anyone can view videos" on public.videos
  for select using (true);

create policy "Authenticated users can insert videos" on public.videos
  for insert with check (true);

create policy "Owners can update their videos" on public.videos
  for update using (owner_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

create policy "Owners can delete their videos" on public.videos
  for delete using (owner_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_users_updated_at
  before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger handle_videos_updated_at
  before update on public.videos
  for each row execute procedure public.handle_updated_at();
*/
