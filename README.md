# TG(AI)F

The bucket list that grows back.

TG(AI)F is a mobile-first office-party game created for a sustainable design
and construction team in Kampala. Players complete party missions and tick
them off to grow a personal bamboo plantation.

## Current version

- Google-style local preview entry
- 28 party bucket-list missions
- Animated bamboo plantation that grows with every completed task
- Progress stages, search, filters, reset and sharing
- Device-local progress persistence
- Responsive desktop and mobile layouts

Google authentication, account-based progress and the shared leaderboard are
the next implementation stage. They will use Supabase after the Vercel project
and its Supabase integration are created.

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

The project is a standard Next.js application prepared for Vercel. Import this
repository into Vercel, then provision Supabase from the Vercel Marketplace so
its environment variables are synchronized automatically.
