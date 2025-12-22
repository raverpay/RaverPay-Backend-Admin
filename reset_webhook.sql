-- Find the webhook log for this CCTP transfer
SELECT * FROM circle_webhook_logs 
WHERE notification_id = 'ecdc64f5-8b4c-44aa-bf30-9404ef39ab54';

-- Mark it as unprocessed so it can be retried
UPDATE circle_webhook_logs 
SET processed = false, processed_at = NULL 
WHERE notification_id = 'ecdc64f5-8b4c-44aa-bf30-9404ef39ab54';

-- Then trigger a retry via API or wait for Circle to retry
