ALTER TABLE agent_runs
ADD COLUMN IF NOT EXISTS input_tokens integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS output_tokens integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_cost_usd numeric DEFAULT 0;
