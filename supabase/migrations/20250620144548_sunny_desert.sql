/*
  # Create weight-photos storage bucket

  1. Storage Setup
    - Create `weight-photos` bucket for storing weigh-in photos
    - Set bucket to be private (not publicly accessible by default)
    - Configure appropriate file size limits

  2. Security Policies
    - Allow authenticated users to upload photos to their own folder
    - Allow authenticated users to read their own photos
    - Allow authenticated users to delete their own photos
    - Prevent access to other users' photos

  3. Configuration
    - Set maximum file size to 5MB
    - Allow common image formats (JPEG, PNG, WebP)
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

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload photos to their own folder
CREATE POLICY "Users can upload their own weight photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'weight-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to view their own photos
CREATE POLICY "Users can view their own weight photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'weight-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to update their own photos
CREATE POLICY "Users can update their own weight photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'weight-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'weight-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to delete their own photos
CREATE POLICY "Users can delete their own weight photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'weight-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);