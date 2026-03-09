-- Create searches table
CREATE TABLE IF NOT EXISTS searches (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  image_data TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create search_results table
CREATE TABLE IF NOT EXISTS search_results (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id VARCHAR NOT NULL REFERENCES searches(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  match_score REAL NOT NULL,
  title TEXT NOT NULL,
  source_url TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  is_unlocked BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id VARCHAR NOT NULL REFERENCES searches(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDT',
  wallet_address TEXT NOT NULL,
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_searches_session_id ON searches(session_id);
CREATE INDEX IF NOT EXISTS idx_searches_status ON searches(status);
CREATE INDEX IF NOT EXISTS idx_search_results_search_id ON search_results(search_id);
CREATE INDEX IF NOT EXISTS idx_payments_search_id ON payments(search_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
