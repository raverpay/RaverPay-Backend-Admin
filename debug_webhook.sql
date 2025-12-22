-- Check the webhook logs for this CCTP transfer
SELECT 
  notification_id,
  event_type,
  processed,
  error,
  payload->'notification'->>'state' as state,
  payload->'notification'->>'refId' as ref_id,
  payload->'notification'->>'id' as transaction_id,
  received_at,
  processed_at
FROM circle_webhook_logs 
WHERE payload->'notification'->>'refId' = 'CCTP-1766346812362-670A1DE5'
ORDER BY received_at ASC;

-- Check the CCTP transfer
SELECT 
  id,
  reference,
  state,
  burn_transaction_id,
  burn_transaction_hash,
  burn_confirmed_at
FROM circle_cctp_transfers 
WHERE reference = 'CCTP-1766346812362-670A1DE5';

-- Check if CircleTransaction was created
SELECT 
  id,
  circle_transaction_id,
  reference,
  state,
  transaction_hash,
  ref_id,
  created_at
FROM circle_transactions 
WHERE ref_id = 'CCTP-1766346812362-670A1DE5'
   OR circle_transaction_id = '4cc63a67-31fa-5eb2-82a1-bd24e4499355';
