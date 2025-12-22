-- Check the webhook logs for the latest CCTP transfer
SELECT 
  id,
  notification_id,
  event_type,
  processed,
  error,
  payload->'notification'->>'state' as state,
  payload->'notification'->>'refId' as ref_id,
  payload->'notification'->>'id' as transaction_id,
  received_at,
  processed_at,
  retry_count
FROM circle_webhook_logs 
WHERE payload->'notification'->>'refId' = 'CCTP-1766347408812-29DB8349'
ORDER BY received_at ASC;
