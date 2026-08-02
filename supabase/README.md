# Supabase setup

This directory contains the TG(AI)F database migration.

Apply every file in `migrations/` in timestamp order. With a linked Supabase CLI,
run `supabase db push`. Otherwise open the connected project's **Supabase Studio
→ SQL Editor** and run each migration as a separate query.

The migration creates:

- private Google-backed player profiles;
- the TGIF party tasks;
- private, user-owned task completions;
- a signed-in aggregate leaderboard that omits auth IDs, avatars, and activity
  timestamps;
- row-level security policies for every exposed table.

The browser uses only the Supabase publishable key. A Supabase secret key is
required server-side for permanent account deletion and must never be exposed
through a `NEXT_PUBLIC_` environment variable.
