CREATE TABLE IF NOT EXISTS searches (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  image_data TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS search_results (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id VARCHAR NOT NULL REFERENCES searches(id),
  platform TEXT NOT NULL,
  match_score REAL NOT NULL,
  title TEXT NOT NULL,
  source_url TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  is_unlocked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id VARCHAR NOT NULL REFERENCES searches(id),
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDT',
  wallet_address TEXT NOT NULL,
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
