-- Create paypal_processed_sales for atomic webhook dedup
CREATE TABLE IF NOT EXISTS paypal_processed_sales (
    sale_id VARCHAR(64) PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
