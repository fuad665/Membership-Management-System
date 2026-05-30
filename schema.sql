-- Enable UUID extension (useful for generating random IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role TEXT NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('active', 'inactive', 'pending')) NOT NULL DEFAULT 'active',
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PROFILES TABLE (Extends Supabase built-in auth.users metadata)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) RULES
-- ==========================================

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if they exist (prevents SQL editor errors on re-run)
DROP POLICY IF EXISTS "Allow public read access to organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow authenticated admins full access to organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow public read access to members" ON public.members;
DROP POLICY IF EXISTS "Allow authenticated admins full access to members" ON public.members;
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;

-- --- Organizations Policies ---
-- Allow public select (so validators can read organization name for QR verification pages)
CREATE POLICY "Allow public read access to organizations" 
    ON public.organizations FOR SELECT USING (true);

-- Allow authenticated users (registered admins) full CRUD access
CREATE POLICY "Allow authenticated admins full access to organizations" 
    ON public.organizations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- --- Members Policies ---
-- Allow public select (so validators can read member profile for QR verification pages)
CREATE POLICY "Allow public read access to members" 
    ON public.members FOR SELECT USING (true);

-- Allow authenticated users (registered admins) full CRUD access
CREATE POLICY "Allow authenticated admins full access to members" 
    ON public.members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- --- Profiles Policies ---
-- Allow users to read/edit only their own admin profile
CREATE POLICY "Allow users to read their own profile" 
    ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update their own profile" 
    ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ==========================================
-- AUTOMATION TRIGGERS FOR USER REGISTRATION
-- ==========================================

-- Clean up existing trigger and trigger function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create trigger function to automatically insert profile row on auth registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Admin User'),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger function to the auth.users table
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
