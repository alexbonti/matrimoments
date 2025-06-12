/*
  # Wedding Moments Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users.id)
      - `name` (text, required) - Guest's name
      - `created_at` (timestamp)
    
    - `photobook_images`
      - `id` (uuid, primary key)
      - `image_url` (text, required) - URL from Supabase storage
      - `uploader_id` (uuid, references profiles.id)
      - `uploader_name` (text, denormalized for display)
      - `created_at` (timestamp)
    
    - `guestbook_posts`
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references profiles.id)
      - `creator_name` (text, denormalized for display)
      - `type` (enum: TEXT or IMAGE)
      - `content` (text) - Message content or image URL
      - `position` (jsonb) - { x: number, y: number } for wall positioning
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read all data
    - Add policies for users to insert their own content
    - Create storage bucket for wedding photos with public access

  3. Real-time
    - Enable real-time subscriptions on guestbook_posts for live updates
*/

-- Create custom types
CREATE TYPE post_type AS ENUM ('TEXT', 'IMAGE');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create photobook_images table
CREATE TABLE IF NOT EXISTS photobook_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  uploader_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  uploader_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create guestbook_posts table
CREATE TABLE IF NOT EXISTS guestbook_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  creator_name text NOT NULL,
  type post_type NOT NULL,
  content text NOT NULL,
  position jsonb NOT NULL DEFAULT '{"x": 0, "y": 0}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photobook_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestbook_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for photobook_images
CREATE POLICY "Users can read all photobook images"
  ON photobook_images
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert photobook images"
  ON photobook_images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploader_id);

-- Create policies for guestbook_posts
CREATE POLICY "Users can read all guestbook posts"
  ON guestbook_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert guestbook posts"
  ON guestbook_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- Create storage bucket for wedding photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('wedding-photos', 'wedding-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for wedding photos
CREATE POLICY "Anyone can view wedding photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'wedding-photos');

CREATE POLICY "Authenticated users can upload wedding photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'wedding-photos');

-- Enable real-time for guestbook posts
ALTER PUBLICATION supabase_realtime ADD TABLE guestbook_posts;