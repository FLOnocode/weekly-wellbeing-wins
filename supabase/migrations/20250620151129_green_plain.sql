/*
  # Create weight-photos storage bucket and RLS policies

  1. Storage Setup
    - Create weight-photos bucket for storing weight proof photos
    - Set file size limit to 5MB
    - Allow only image formats (JPEG, PNG, WebP)
    - Make bucket private (not public)

  2. Security Policies
    - Users can only access their own photos (organized by user_id folders)
    - Full CRUD operations for authenticated users on their own files
    - Photos are stored in user-specific folders: user_id/filename.ext
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

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can upload their own weight photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own weight photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own weight photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own weight photos" ON storage.objects;

-- Policy: Allow authenticated users to upload photos to their own folder
CREATE POLICY "Users can upload their own weight photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'weight-photos' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to view their own photos
CREATE POLICY "Users can view their own weight photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'weight-photos' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to update their own photos
CREATE POLICY "Users can update their own weight photos"
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
CREATE POLICY "Users can delete their own weight photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'weight-photos' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);