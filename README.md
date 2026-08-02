# TG(AI)F

The TGIF party task list.

TG(AI)F is a mobile-first game for team gatherings. Players tick party tasks to
grow bamboo clumps on a plot.

## Current version

- Direct Google ID-token sign-in with Supabase session management
- Local preview fallback when Supabase is not configured
- 101 TGIF party tasks
- Animated bamboo plot that grows with every tick
- Account-based progress, private profiles and a signed-in player leaderboard
- Account controls for log out and permanent account deletion
- Search, filters, plot reset and five-player task limits
- Responsive desktop and mobile layouts

The database migration and setup notes are in [`supabase/`](supabase/).
For a beginner-friendly architecture and security walkthrough, read
[`docs/CODEBASE_AND_SECURITY_GUIDE.md`](docs/CODEBASE_AND_SECURITY_GUIDE.md).

## Run locally

Requirements: Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without environment variables the app runs in local-preview mode and does not
contact Supabase or Google. Copy `.env.example` to `.env.local` to configure a
deployment; never commit the populated file.

## Validate for production

```bash
npm run build
npm run start
```

## Deployment

The project is a standard Next.js application prepared for Vercel. Provision
Supabase from the Vercel Marketplace so its environment variables are
synchronized automatically. Apply the included migration, configure the Google
provider, and add the deployed app under the Google OAuth client’s Authorized
JavaScript origins. Direct sign-in keeps the account chooser on the app’s own
domain instead of displaying the Supabase project callback URL.

Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS deployment URL. The Supabase
secret key is server-only and is used exclusively by the account-deletion route.
Never expose it through a `NEXT_PUBLIC_` variable.

## Privacy and security

- Anonymous visitors cannot query profile or leaderboard identity data.
- Signed-in players see leaderboard display names and scores, but not auth user
  IDs, profile photos, or activity timestamps.
- Completion records are protected by row-level security and visible only to
  their owner; aggregate task counts are visible to signed-in players.
- Account deletion removes the auth user and cascades to their profile and
  completions.

Please report vulnerabilities privately using the repository's **Security →
Report a vulnerability** flow. Do not include credentials or personal data in a
public issue. See [`SECURITY.md`](SECURITY.md).

Before changing the repository to public, review the Git history for author
email addresses and enable GitHub secret scanning, push protection, private
vulnerability reporting, and branch protection.

## License

This project is available under the [MIT License](LICENSE).
