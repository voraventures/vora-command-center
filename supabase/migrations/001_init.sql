-- MRR snapshots (manually updated or via webhook)
CREATE TABLE mrr_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product text NOT NULL,
  mrr_usd numeric NOT NULL,
  subscriber_count integer NOT NULL,
  recorded_at timestamptz DEFAULT now()
);

-- Agent run log
CREATE TABLE agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  agent_label text NOT NULL,
  machine text NOT NULL,
  model text NOT NULL,
  input_summary text,
  output_summary text,
  duration_ms integer,
  status text DEFAULT 'success',
  ran_at timestamptz DEFAULT now()
);

-- Hermes activity log
CREATE TABLE hermes_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  detail text,
  product text,
  logged_at timestamptz DEFAULT now()
);

-- Product status
CREATE TABLE products (
  id text PRIMARY KEY,
  label text NOT NULL,
  url text NOT NULL,
  github_repo text NOT NULL,
  status text DEFAULT 'live',
  last_deploy timestamptz,
  notes text
);

-- Seed products
INSERT INTO products VALUES
  ('sparkcheck', 'SparkCheck', 'https://sparkcheckapp.com', 'voraventures/vora-sparkcheck', 'live', now(), 'PWA dating app'),
  ('twitter_growth_optimizer', 'Twitter Growth Optimizer', 'https://twitter-growth-optimizer.vercel.app', 'voraventures/vora-twitter-growth-optimizer', 'live', now(), '$15/mo SaaS');

-- Enable Realtime (run these in Supabase dashboard or via CLI)
-- ALTER PUBLICATION supabase_realtime ADD TABLE agent_runs;
-- ALTER PUBLICATION supabase_realtime ADD TABLE hermes_log;
-- ALTER PUBLICATION supabase_realtime ADD TABLE mrr_snapshots;
