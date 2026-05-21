# Campus Notice Board

A Vite + React + Supabase notice board with email/password auth, protected inserts/deletes, public notice viewing, and Supabase Realtime inserts.

## Setup

1. Run the SQL in `supabase/schema.sql` inside the Supabase SQL Editor.
2. Copy `.env.example` to `.env.local` and fill in your Supabase project URL and anon key.
3. Install and run:

```bash
npm install
npm run dev
```

The app expects email/password auth to be enabled in Supabase Authentication.
