# TG(AI)F

The bucket list that grows back.

TG(AI)F is a mobile-first office-party game created for a sustainable design
and construction team in Kampala. Players complete party missions and tick
them off to grow a personal bamboo plantation.

## Current version

- Direct Google ID-token sign-in with Supabase session management
- Local preview fallback when Supabase is not configured
- 28 party bucket-list missions
- Animated bamboo plantation that grows with every completed task
- Account-based progress, profiles and a public leaderboard
- Progress stages, search, filters, reset and sharing
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
