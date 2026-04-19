
-- Create storage bucket for book covers
INSERT INTO storage.buckets (id, name, public) VALUES ('book-covers', 'book-covers', true);

-- Allow public read access
CREATE POLICY "Book covers are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'book-covers');

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own book covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'book-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own covers
CREATE POLICY "Users can update their own book covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'book-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own covers
CREATE POLICY "Users can delete their own book covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'book-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
