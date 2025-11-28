# Supabase Storage Setup Guide

## Create the Property Images Bucket

To enable image uploads, you need to create a storage bucket in your Supabase project.

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to your project: https://supabase.com/dashboard
   - Select your project

2. **Open Storage**
   - Click on "Storage" in the left sidebar
   - Click "New bucket"

3. **Create Bucket**
   - **Name**: `property-images` (must match exactly)
   - **Public bucket**: ✅ Enable (check this box)
   - Click "Create bucket"

4. **Set Storage Policies** ⚠️ **REQUIRED - Uploads will fail without these!**

   After creating the bucket, you MUST add storage policies. Go to SQL Editor and run:

   ```sql
   -- Drop existing policies if they exist
   DROP POLICY IF EXISTS "Users can upload images" ON storage.objects;
   DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
   DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

   -- Allow authenticated users to upload images
   CREATE POLICY "Users can upload images"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'property-images');

   -- Allow public read access
   CREATE POLICY "Public can view images"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'property-images');

   -- Allow authenticated users to delete their own images
   CREATE POLICY "Users can delete own images"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'property-images');
   ```

### Alternative: Use SQL Editor

You can also run this SQL in the SQL Editor:

```sql
-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

-- Allow public read access
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images');
```

### Verify Setup

After creating the bucket:
1. Try uploading an image in the Add Property form
2. Check the Storage section in Supabase Dashboard
3. You should see uploaded images in the `property-images` bucket

### Troubleshooting

**Error: "Bucket not found"**
- Make sure the bucket name is exactly `property-images` (lowercase, with hyphen)
- Ensure the bucket is marked as public
- Check that you're using the correct Supabase project

**Error: "Permission denied"**
- Verify the storage policies are created correctly
- Make sure you're logged in as an authenticated user
- Check that RLS (Row Level Security) is enabled on the bucket
