-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "billing_cycles_completed" INTEGER NOT NULL DEFAULT 0;

-- Backfill for existing PayPal subscriptions: count processed sales per subscription.
-- Each non-duplicate SALE.COMPLETED in paypal_processed_sales that matches a
-- subscription's billing_agreement_id counts as one completed billing cycle.
-- The raw SQL in the webhook handler inserts into paypal_processed_sales on every
-- SALE.COMPLETED, so each row = one billing cycle processed.
-- (Currently zero subscriptions — safe no-op.)
UPDATE "subscriptions" s
SET "billing_cycles_completed" = (
  SELECT COUNT(*) FROM "paypal_processed_sales" pps
  WHERE pps.sale_id IN (
    SELECT t.metadata::jsonb->>'saleId'
    FROM "transactions" t
    WHERE t.type = 'SUBSCRIPTION'
      AND t.metadata::jsonb->>'paypalSubId' = s.paypal_sub_id
  )
)
WHERE s.paypal_sub_id IS NOT NULL;
