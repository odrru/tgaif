# TG(AI)F

The TGIF party task list.

TG(AI)F is a mobile-first game for a sustainable design and construction team
in Kampala. Players tick TGIF party tasks to grow bamboo clumps on a plot.

## Current version

- Direct Google ID-token sign-in with Supabase session management
- Local preview fallback when Supabase is not configured
- 101 TGIF party tasks
- Animated bamboo plot that grows with every tick
- Account-based progress, profiles and a public leaderboard
- Account controls for log out and permanent account deletion
- Search, filters, plot reset and five-player task limits
- Responsive desktop and mobile layouts

The database migration and setup notes are in [`supabase/`](supabase/).

## Run locally

Requirements: Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
