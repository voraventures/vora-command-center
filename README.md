# Vora Command Center

Internal dashboard for Vora Ventures. Tracks MRR, agent runs, and Hermes activity in real-time.

## Setup

### 1. Supabase

1. Create a project at https://supabase.com
2. Go to SQL Editor and run `supabase/migrations/001_init.sql`
3. In Table Editor, enable Realtime on: `agent_runs`, `hermes_log`, `mrr_snapshots`
4. Get your API keys from: Settings → API

### 2. Environment Variables

Copy `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase project settings (keep secret!)
- `VORA_WEBHOOK_SECRET` — any secure random string (use: `openssl rand -hex 32`)

### 3. Local dev

```bash
npm install
npm run dev
```

### 4. Deploy to Vercel

```bash
vercel --org voraventures --project vora-command-center
```

Add all env vars in Vercel dashboard under Settings → Environment Variables.

## API Endpoints

All endpoints require `Authorization: Bearer <VORA_WEBHOOK_SECRET>` header.

### POST /api/agent-run
```json
{
  "agent_id": "hermes-v1",
  "agent_label": "Hermes Orchestrator",
  "machine": "mac_studio",
  "model": "qwen3:14b",
  "input_summary": "Summarize tweets",
  "output_summary": "Done — 12 tweets processed",
  "duration_ms": 4200,
  "status": "success"
}
```

### POST /api/hermes-log
```json
{
  "action": "tweet_scheduled",
  "detail": "Scheduled 3 tweets for @voraventures",
  "product": "twitter_growth_optimizer"
}
```

### POST /api/mrr
```json
{
  "product": "sparkcheck",
  "mrr_usd": 340,
  "subscriber_count": 23
}
```

### GET /api/mrr
Returns latest MRR snapshot per product.
