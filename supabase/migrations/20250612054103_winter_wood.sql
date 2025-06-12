/*
  # Add thumbnail URL to photobook images

  1. Changes
    - Add `thumbnail_url` column to `photobook_images` table
    - Set default value to empty string for existing records
    - Make column nullable to handle migration gracefully

  2. Notes
    - Existing images will need thumbnails generated separately
    - New uploads will include both full image and thumbnail
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photobook_images' AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE photobook_images ADD COLUMN thumbnail_url text DEFAULT '';
  END IF;
END $$;