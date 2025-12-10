-- Kinetic RWA Training Data Marketplace Database Schema
-- Run this in your Supabase SQL Editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    username TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    world_id_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster wallet lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);

-- =============================================
-- VIDEOS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    
    -- IPFS storage
    ipfs_hash TEXT NOT NULL,
    ipfs_url TEXT NOT NULL,
    metadata_hash TEXT,
    metadata_url TEXT,
    thumbnail_url TEXT,
    
    -- Video metadata
    duration INTEGER, -- in seconds
    file_size BIGINT, -- in bytes
    mime_type TEXT,
    
    -- Story Protocol IP registration
    ip_id TEXT,
    license_terms_id TEXT,
    license_terms JSONB,
    tx_hash TEXT,
    
    -- NFT / Blockchain data
    token_id TEXT, -- NFT Token ID from KineticVideoNFT contract
    mint_tx_hash TEXT, -- Transaction hash for NFT minting
    ip_tx_hash TEXT, -- Transaction hash for Story Protocol registration
    
    -- Ownership
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    owner_address TEXT NOT NULL,
    
    -- Stats
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_videos_owner_id ON videos(owner_id);
CREATE INDEX IF NOT EXISTS idx_videos_owner_address ON videos(owner_address);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_ipfs_hash ON videos(ipfs_hash);

-- =============================================
-- LICENSES TABLE (Optional - for tracking license purchases)
-- =============================================
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    licensee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    licensee_address TEXT NOT NULL,
    license_type TEXT NOT NULL, -- 'commercial', 'non-commercial', 'exclusive'
    price DECIMAL(18, 8),
    currency TEXT DEFAULT 'IP',
    tx_hash TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_licenses_video_id ON licenses(video_id);
CREATE INDEX IF NOT EXISTS idx_licenses_licensee_id ON licenses(licensee_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users are viewable by everyone" 
    ON users FOR SELECT 
    USING (true);

CREATE POLICY "Users can update own profile" 
    ON users FOR UPDATE 
    USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Anyone can create a user" 
    ON users FOR INSERT 
    WITH CHECK (true);

-- Videos policies
CREATE POLICY "Videos are viewable by everyone" 
    ON videos FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can create videos" 
    ON videos FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Owners can update their videos" 
    ON videos FOR UPDATE 
    USING (owner_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Owners can delete their videos" 
    ON videos FOR DELETE 
    USING (owner_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Licenses policies
CREATE POLICY "Licenses are viewable by involved parties" 
    ON licenses FOR SELECT 
    USING (true);

CREATE POLICY "Anyone can create licenses" 
    ON licenses FOR INSERT 
    WITH CHECK (true);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to increment video views
CREATE OR REPLACE FUNCTION increment_video_views(video_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE videos SET views = views + 1 WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment video likes
CREATE OR REPLACE FUNCTION increment_video_likes(video_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE videos SET likes = likes + 1 WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- MIGRATION: Add NFT and Story Protocol fields
-- =============================================
-- Run this if you already have the videos table and need to add new columns:
/*
ALTER TABLE videos ADD COLUMN IF NOT EXISTS token_id TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS mint_tx_hash TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS ip_tx_hash TEXT;

-- Create index for token_id lookups
CREATE INDEX IF NOT EXISTS idx_videos_token_id ON videos(token_id);
*/

-- =============================================
-- SAMPLE CATEGORIES (for reference)
-- =============================================
-- Categories used in the app:
-- - 'motion' (Human Motion)
-- - 'industrial' (Industrial)
-- - 'nature' (Nature & Wildlife)
-- - 'urban' (Urban Scenes)
-- - 'sports' (Sports & Action)
-- - 'medical' (Medical)
-- - 'autonomous' (Autonomous Vehicles)
-- - 'other' (Other)

-- =============================================
-- NOTES
-- =============================================
-- 1. Make sure to enable the RLS policies in Supabase dashboard
-- 2. For production, configure proper JWT authentication
-- 3. The API routes handle wallet-based auth via request headers
-- 4. Consider adding more indexes based on query patterns
