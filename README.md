# Betme

A **social prediction market** where Betme credits are earned (never purchased, never cashed out). Users post predictions, follow sharp callers, earn badges, share to other socials, message friends, and video chat — while partner ads fund a transparent revenue waterfall.

## Core loops

1. **Earn credits** — signup, referrals, daily use, posting, ads  
2. **Wager credits** — flat fee to enter predictions (entertainment credits only)  
3. **Share ad revenue** — Betme → creator → accurate predictors → participants  
4. **Socialize** — follows, profiles, badges, leaderboards, DMs, video rooms  

## Revenue waterfall

| Share | Recipient |
| --- | --- |
| 40% | Betme platform |
| 25% | Prediction creator |
| 25% | Accurate predictors (activity-weighted) |
| 10% | All participants |

## Social features

- Profiles with bio, badges, accuracy, creator score, referral code  
- Follow graph + following feed  
- Leaderboards: accurate predictors, top creators, popular markets  
- Share to X / Facebook / LinkedIn / copy link  
- Direct messaging  
- Peer-to-peer WebRTC video rooms  

## Stack

Next.js App Router · TypeScript · Tailwind · Prisma · PostgreSQL · jose sessions · WebRTC

## Quick start (local)

```bash
npm install
cp .env.example .env
# Start Postgres, then:
npx prisma migrate dev
npm run db:seed
npm run dev
```

Demo: `demo@betme.app` / `demo1234`  
Referral codes in seed: `DEMOPLAY`, `MAYAVOSS`, `KENJIPK`

## Deploy on Render

This repo includes a Blueprint at [`render.yaml`](./render.yaml):

1. In Render: **New → Blueprint** (or open the linked Betme repo service)
2. Connect `sentience-network/Betme`
3. Use branch `cursor/betme-social-prediction-cca4` (until merged to `main`)
4. Render provisions:
   - `betme` web service (Node)
   - `betme-db` Postgres
   - `DATABASE_URL` + generated `AUTH_SECRET`
5. Build runs `npm ci && prisma generate && next build`
6. Start runs `prisma migrate deploy && next start`

### First-time seed (optional demo data)

From your machine (or Render Shell), with the **External** Database URL:

```bash
DATABASE_URL="postgresql://..." npm run db:seed
```

Do **not** seed on every deploy — the seed script resets demo tables.

### Manual service settings (if not using Blueprint)

| Setting | Value |
| --- | --- |
| Runtime | Node |
| Build Command | `npm ci && npx prisma generate && npm run build` |
| Start Command | `npx prisma migrate deploy && npm run start` |
| Health Check Path | `/api/health` |
| `DATABASE_URL` | From Render Postgres |
| `AUTH_SECRET` | Generate value |

## Credit policy

Betme credits are earned through signup, bringing new users, and platform usage. They **cannot be purchased or exchanged for cash**. They exist only to participate in social predictions.
