SELECT cron.schedule(
  'daily-database-backup',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://rozkgddmaluripvbktje.supabase.co/functions/v1/backup-database',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvemtnZGRtYWx1cmlwdmJrdGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NTA4OTAsImV4cCI6MjA5MTUyNjg5MH0.eol3-JqdqkMUMbXJOhgkrxB9bdifVq8Bv8kiGCibWqk"}'::jsonb,
    body := concat('{"trigger":"cron","time":"', now(), '"}')::jsonb
  ) AS request_id;
  $$
);