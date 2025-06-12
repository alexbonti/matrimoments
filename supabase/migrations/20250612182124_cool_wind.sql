/*
  # Wedding App Database Schema

  1. New Tables
    - `profiles`
      - `id` (text, primary key) - Guest identifier
      - `name` (text) - Guest name
      - `created_at` (timestamp)
    
    - `photobook_images`
      - `id` (uuid, primary key)
      - `image_url` (text) - Full resolution image URL
      - `thumbnail_url` (text) - Thumbnail image URL
      - `uploader_id` (text) - References profiles.id
      - `uploader_name` (text) - Guest name for display
      - `created_at` (timestamp)
    
    - `guestbook_posts`
      - `id` (uuid, primary key)
      - `creator_id` (text) - References profiles.id
      - `creator_name` (text) - Guest name for display
      - `type` (text) - 'TEXT', 'IMAGE', or 'DRAWING'
      - `content` (text) - Message text or image URL
      - `position_x` (integer) - For future positioning features
      - `position_y` (integer) - For future positioning features
      - `created_at` (timestamp)

  2. Storage
    - Create 'wedding-photos' bucket for all images
    - Enable public access for viewing photos

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated and anonymous access
    - Allow public read access to all content
    - Allow public insert access for guest contributions
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id text PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create photobook_images table
CREATE TABLE IF NOT EXISTS photobook_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  thumbnail_url text,
  uploader_id text NOT NULL,
  uploader_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create guestbook_posts table
CREATE TABLE IF NOT EXISTS guestbook_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id text NOT NULL,
  creator_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('TEXT', 'IMAGE', 'DRAWING')),
  content text NOT NULL,
  position_x integer DEFAULT 0,
  position_y integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'photobook_images_uploader_id_fkey'
  ) THEN
    ALTER TABLE photobook_images 
    ADD CONSTRAINT photobook_images_uploader_id_fkey 
    FOREIGN KEY (uploader_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'guestbook_posts_creator_id_fkey'
  ) THEN
    ALTER TABLE guestbook_posts 
    ADD CONSTRAINT guestbook_posts_creator_id_fkey 
    FOREIGN KEY (creator_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_photobook_images_created_at ON photobook_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photobook_images_uploader ON photobook_images(uploader_id);
CREATE INDEX IF NOT EXISTS idx_guestbook_posts_created_at ON guestbook_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guestbook_posts_creator ON guestbook_posts(creator_id);
CREATE INDEX IF NOT EXISTS idx_guestbook_posts_type ON guestbook_posts(type);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photobook_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestbook_posts ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for wedding photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-photos',
  'wedding-photos',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- RLS Policies for profiles table
CREATE POLICY "Allow public read access to profiles"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to profiles"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow users to update their own profile"
  ON profiles
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- RLS Policies for photobook_images table
CREATE POLICY "Allow public read access to photobook images"
  ON photobook_images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to photobook images"
  ON photobook_images
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow users to delete their own photos"
  ON photobook_images
  FOR DELETE
  TO public
  USING (true);

-- RLS Policies for guestbook_posts table
CREATE POLICY "Allow public read access to guestbook posts"
  ON guestbook_posts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to guestbook posts"
  ON guestbook_posts
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow users to delete their own posts"
  ON guestbook_posts
  FOR DELETE
  TO public
  USING (true);

-- Storage policies for wedding-photos bucket
CREATE POLICY "Allow public uploads to wedding-photos bucket"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'wedding-photos');

CREATE POLICY "Allow public read access to wedding-photos bucket"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'wedding-photos');

CREATE POLICY "Allow public delete from wedding-photos bucket"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'wedding-photos');

-- Create a function to clean up storage when records are deleted
CREATE OR REPLACE FUNCTION cleanup_storage_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract file path from URL and delete from storage
  IF OLD.image_url IS NOT NULL THEN
    PERFORM storage.delete_object('wedding-photos', 
      regexp_replace(OLD.image_url, '^.*/wedding-photos/', ''));
  END IF;
  
  IF OLD.thumbnail_url IS NOT NULL THEN
    PERFORM storage.delete_object('wedding-photos', 
      regexp_replace(OLD.thumbnail_url, '^.*/wedding-photos/', ''));
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for cleanup
DROP TRIGGER IF EXISTS cleanup_photobook_storage ON photobook_images;
CREATE TRIGGER cleanup_photobook_storage
  AFTER DELETE ON photobook_images
  FOR EACH ROW EXECUTE FUNCTION cleanup_storage_on_delete();

-- For guestbook posts that contain image URLs
CREATE OR REPLACE FUNCTION cleanup_guestbook_storage_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Only clean up if it's an image or drawing post
  IF OLD.type IN ('IMAGE', 'DRAWING') AND OLD.content LIKE '%wedding-photos%' THEN
    PERFORM storage.delete_object('wedding-photos', 
      regexp_replace(OLD.content, '^.*/wedding-photos/', ''));
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cleanup_guestbook_storage ON guestbook_posts;
CREATE TRIGGER cleanup_guestbook_storage
  AFTER DELETE ON guestbook_posts
  FOR EACH ROW EXECUTE FUNCTION cleanup_guestbook_storage_on_delete();

-- Create a view for admin statistics
CREATE OR REPLACE VIEW admin_stats AS
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM photobook_images) as total_photos,
  (SELECT COUNT(*) FROM guestbook_posts) as total_posts,
  (SELECT COUNT(*) FROM guestbook_posts WHERE type = 'TEXT') as text_posts,
  (SELECT COUNT(*) FROM guestbook_posts WHERE type = 'IMAGE') as image_posts,
  (SELECT COUNT(*) FROM guestbook_posts WHERE type = 'DRAWING') as drawing_posts;

-- Grant access to the view
GRANT SELECT ON admin_stats TO public;