/*
  # Add avatar support to profiles and create avatars storage bucket

  1. Database Changes
    - Add avatar_url column to profiles table
    - Create avatars storage bucket for user profile pictures

  2. Storage Setup
    - Create avatars bucket with 1MB file size limit
    - Allow only image formats (JPEG, PNG, WebP)
    - Make bucket public for easy display
    - Add RLS policies for user-specific access

  3. Security
    - Users can only upload/manage their own avatars
    - Avatars are stored in user-specific folders: user_id/avatar.ext
*/

-- Add avatar_url column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create the avatars storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Set to true for public access for easy display
  1048576, -- 1MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- Policy: Allow authenticated users to upload avatars to their own folder
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy: Allow everyone to view avatars (since bucket is public)
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy: Allow authenticated users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);