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

Next.js App Router · TypeScript · Tailwind · Prisma · SQLite · jose sessions · WebRTC

## Quick start

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

Demo: `demo@betme.app` / `demo1234`  
Referral codes in seed: `DEMOPLAY`, `MAYAVOSS`, `KENJIPK`

## Credit policy

Betme credits are earned through signup, bringing new users, and platform usage. They **cannot be purchased or exchanged for cash**. They exist only to participate in social predictions.
