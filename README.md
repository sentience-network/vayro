# Betme

A legal social prediction market where **Betme credits are earned, never purchased**. Users post predictions, participants watch partner ads to enter for a flat credit fee, and ad revenue is shared through a transparent waterfall.

## Revenue waterfall

1. **Betme (40%)** — platform share  
2. **Prediction creator (25%)** — attracts participants  
3. **Accurate predictors (25%)** — weighted by activity  
4. **All participants (10%)** — base ad share for everyone who entered  

## Credit economy

Credits are earned via:

- Signup bonus (100)
- Daily check-in (15)
- Watching ads to enter (5)
- Partner ad rewards (20)
- Posting a market (25)

There is **no credit store**. Flat credit fees unlock predictions; real dollars come from partner ads, not from buying chips or cash wagering.

## Stack

- Next.js App Router + TypeScript + Tailwind
- Prisma + SQLite
- Cookie session auth (jose + bcryptjs)

## Quick start

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo account

- Email: `demo@betme.app`
- Password: `demo1234`

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start local app |
| `npm run build` | Production build |
| `npm run db:seed` | Seed demo users & markets |
| `npm run db:reset` | Reset DB + reseed |

## Product framing

Betme is designed as entertainment + creator economy — not a sportsbook. No credit purchases, no cash stakes, no odds book. Confirm compliance for your launch jurisdictions.
