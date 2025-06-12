/*
  # Wedding Moments Database Schema

  1. New Tables
    - `profiles` - User profiles with names (matches existing pattern)
    - `photobook_images` - Photo gallery images (already exists, ensuring compatibility)
    - `guestbook_posts` - Interactive wall posts (already exists, ensuring compatibility)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (matching existing schema)
    - Allow anonymous users to read and create content

  3. Storage
    - Create wedding-photos bucket for image uploads
    - Set up public access policies for images

  4. Real-time
    - Enable real-time subscriptions for guestbook posts
*/

-- Create profiles table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS profiles (
  id text PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Ensure photobook_images table exists with correct structure
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photobook_images') THEN
    CREATE TABLE photobook_images (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      image_url text NOT NULL,
      uploader_id text NOT NULL,
      uploader_name text NOT NULL,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Ensure guestbook_posts table exists with correct structure
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'guestbook_posts') THEN
    CREATE TABLE guestbook_posts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id text NOT NULL,
      creator_name text NOT NULL,
      type text NOT NULL CHECK (type IN ('TEXT', 'IMAGE', 'DRAWING')),
      content text NOT NULL,
      position_x numeric NOT NULL,
      position_y numeric NOT NULL,
      background_color text,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_photobook_images_created_at ON photobook_images (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guestbook_posts_created_at ON guestbook_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guestbook_posts_position ON guestbook_posts (position_x, position_y);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photobook_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestbook_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles (allow public access)
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
CREATE POLICY "Anyone can read profiles"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Anyone can create profiles" ON profiles;
CREATE POLICY "Anyone can create profiles"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policies for photobook_images (allow public access)
DROP POLICY IF EXISTS "Anyone can read photobook images" ON photobook_images;
CREATE POLICY "Anyone can read photobook images"
  ON photobook_images
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Anyone can upload photobook images" ON photobook_images;
CREATE POLICY "Anyone can upload photobook images"
  ON photobook_images
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policies for guestbook_posts (allow public access)
DROP POLICY IF EXISTS "Anyone can read guestbook posts" ON guestbook_posts;
CREATE POLICY "Anyone can read guestbook posts"
  ON guestbook_posts
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Anyone can create guestbook posts" ON guestbook_posts;
CREATE POLICY "Anyone can create guestbook posts"
  ON guestbook_posts
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create storage bucket for wedding photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('wedding-photos', 'wedding-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for wedding photos
DROP POLICY IF EXISTS "Anyone can view wedding photos" ON storage.objects;
CREATE POLICY "Anyone can view wedding photos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'wedding-photos');

DROP POLICY IF EXISTS "Anyone can upload wedding photos" ON storage.objects;
CREATE POLICY "Anyone can upload wedding photos"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'wedding-photos');

-- Enable real-time for guestbook posts
ALTER PUBLICATION supabase_realtime ADD TABLE guestbook_posts;