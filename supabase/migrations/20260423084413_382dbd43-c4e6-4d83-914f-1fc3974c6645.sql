DROP POLICY IF EXISTS "Event media files are publicly readable" ON storage.objects;

CREATE POLICY "Published event media files are readable"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'event-media'
  AND EXISTS (
    SELECT 1
    FROM public.event_media em
    JOIN public.events e ON e.id = em.event_id
    WHERE em.url LIKE '%' || storage.objects.name
      AND e.status = 'published'::public.event_status
      AND e.approval_status = 'approved'::public.event_approval_status
  )
);