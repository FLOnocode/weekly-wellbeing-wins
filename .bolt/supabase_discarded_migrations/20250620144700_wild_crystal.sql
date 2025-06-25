/*
  # Create weight-photos storage bucket

  1. Storage Setup
    - Create `weight-photos` bucket for storing weight proof photos
    - Set bucket to private (not publicly accessible)
    - Configure file size limit (5MB) and allowed MIME types
    
  2. Security Policies
    - Users can only upload photos to their own folder (user_id/filename)
    - Users can only view, update, and delete their own photos
    - All operations require authentication

  3. Bucket Configuration
    - Private bucket (public = false)
    - 5MB file size limit
    - Allowed formats: JPEG, PNG, WebP
*/

-- Create the weight-photos storage bucket using Supabase function
SELECT storage.create_bucket('weight-photos', '{
  "public": false,
  "file_size_limit": 5242880,
  "allowed_mime_types": ["image/jpeg", "image/png", "image/webp", "image/jpg"]
}'::jsonb);

-- Create RLS policies for the weight-photos bucket
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