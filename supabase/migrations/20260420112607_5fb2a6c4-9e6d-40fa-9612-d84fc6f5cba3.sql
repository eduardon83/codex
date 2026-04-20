
INSERT INTO storage.buckets (id, name, public)
VALUES ('library-card-photos', 'library-card-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Library card photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'library-card-photos');

CREATE POLICY "Users can upload own library card photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'library-card-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own library card photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'library-card-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own library card photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'library-card-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
