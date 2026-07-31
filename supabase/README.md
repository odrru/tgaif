# Supabase setup

This directory contains the TG(AI)F database migration.

If the local Supabase CLI is not linked, open the connected project’s
**Supabase Studio → SQL Editor**, create a new query, paste the complete contents
of `migrations/20260731120000_initial_game_schema.sql`, and select **Run**.

The migration creates:

- public Google-backed player profiles;
- the TGIF party tasks;
- private, user-owned task completions;
- a public aggregate leaderboard;
- row-level security policies for every exposed table.

No service-role or secret key is used by the web application.
