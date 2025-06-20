/*
  # Create storage bucket for weight photos

  1. Storage Setup
    - Create weight-photos bucket with proper configuration
    - Set up RLS policies for user access control

  2. Security
    - Enable RLS on storage.objects
    - Allow users to manage their own photos only
*/

-- Create the weight-photos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'weight-photos',
  'weight-photos',
  false,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the weight-photos bucket
-- Note: We don't need to enable RLS on storage.objects as it's already enabled by default

-- Policy: Allow authenticated users to upload photos to their own folder
CREATE POLICY IF NOT EXISTS "Users can upload their own weight photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'weight-photos' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to view their own photos
CREATE POLICY IF NOT EXISTS "Users can view their own weight photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'weight-photos' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to update their own photos
CREATE POLICY IF NOT EXISTS "Users can update their own weight photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'weight-photos' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'weight-photos' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to delete their own photos
CREATE POLICY IF NOT EXISTS "Users can delete their own weight photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'weight-photos' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);