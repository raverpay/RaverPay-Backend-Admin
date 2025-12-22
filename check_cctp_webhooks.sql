-- Check all webhooks for this CCTP transfer
SELECT 
  notification_id,
  event_type,
  processed,
  processed_at,
  payload->>'notification'->>'state' as state,
  payload->>'notification'->>'refId' as ref_id,
  received_at
FROM circle_webhook_logs 
WHERE payload->>'notification'->>'refId' = 'CCTP-1766345614299-DED58427'
ORDER BY received_at ASC;

-- Check the CCTP transfer status
SELECT 
  id,
  reference,
  state,
  burn_transaction_id,
  burn_transaction_hash,
  burn_confirmed_at
FROM circle_cctp_transfers 
WHERE reference = 'CCTP-1766345614299-DED58427';

-- Check if CircleTransaction was created
SELECT 
  id,
  circle_transaction_id,
  reference,
  state,
  transaction_hash,
  ref_id
FROM circle_transactions 
WHERE ref_id = 'CCTP-1766345614299-DED58427'
   OR circle_transaction_id = 'fd0eae9f-05a8-59c0-b7c5-8e9d7b1dfc88';
