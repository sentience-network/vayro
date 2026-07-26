import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CREDIT_REWARDS } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  await prisma.revenuePayout.deleteMany();
  await prisma.adView.deleteMany();
  await prisma.marketEntry.deleteMany();
  await prisma.creditLedger.deleteMany();
  await prisma.market.deleteMany();
  await prisma.user.deleteMany();
  await prisma.platformConfig.deleteMany();

  await prisma.platformConfig.create({ data: { id: "default" } });

  const passwordHash = await bcrypt.hash("demo1234", 10);

  const demo = await prisma.user.create({
    data: {
      email: "demo@betme.app",
      username: "demo",
      displayName: "Demo Player",
      passwordHash,
      credits: CREDIT_REWARDS.signup + 40,
      accuracyScore: 0.67,
      totalPredictions: 6,
      correctPredictions: 4,
      creditLedger: {
        create: [
          { amount: CREDIT_REWARDS.signup, reason: "signup_bonus" },
          { amount: 15, reason: "daily_bonus" },
          { amount: 25, reason: "create_market_bonus" },
        ],
      },
    },
  });

  const maya = await prisma.user.create({
    data: {
      email: "maya@betme.app",
      username: "maya",
      displayName: "Maya Voss",
      passwordHash,
      credits: 180,
      accuracyScore: 0.8,
      totalPredictions: 10,
      correctPredictions: 8,
      creditLedger: {
        create: [{ amount: CREDIT_REWARDS.signup, reason: "signup_bonus" }],
      },
    },
  });

  const ken = await prisma.user.create({
    data: {
      email: "ken@betme.app",
      username: "kenji",
      displayName: "Kenji Park",
      passwordHash,
      credits: 120,
      accuracyScore: 0.55,
      totalPredictions: 9,
      correctPredictions: 5,
      creditLedger: {
        create: [{ amount: CREDIT_REWARDS.signup, reason: "signup_bonus" }],
      },
    },
  });

  const inSevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const openSports = await prisma.market.create({
    data: {
      slug: "summer-finals-mvp-race",
      title: "Who takes Summer Finals MVP?",
      description:
        "Social prediction on the finals MVP. Watch a short partner ad, spend a flat credit fee, and pick your call. Accurate predictors earn a larger slice of the ad pool.",
      category: "Sports",
      optionsJson: JSON.stringify(["Rivera", "Okoye", "Chen", "Other"]),
      entryFee: 10,
      status: "OPEN",
      resolvesAt: inSevenDays,
      adPoolCents: 4200,
      participantCount: 2,
      creatorId: maya.id,
    },
  });

  const openTech = await prisma.market.create({
    data: {
      slug: "next-gadget-drop-week",
      title: "Will the next flagship drop this week?",
      description:
        "A culture-tech call with a flat entry fee in Betme credits. Credits are earned, never bought. Ad views fund the shared revenue pool.",
      category: "Tech",
      optionsJson: JSON.stringify(["Yes", "No"]),
      entryFee: 10,
      status: "OPEN",
      resolvesAt: inThreeDays,
      adPoolCents: 1850,
      participantCount: 1,
      creatorId: ken.id,
    },
  });

  const resolved = await prisma.market.create({
    data: {
      slug: "festival-headliner-surprise",
      title: "Surprise festival headliner?",
      description:
        "Resolved demo market showing how ad revenue flows: Betme first, then the creator, then accurate predictors, then every participant.",
      category: "Entertainment",
      optionsJson: JSON.stringify(["Yes", "No"]),
      entryFee: 10,
      status: "RESOLVED",
      resolvesAt: yesterday,
      resolvedOption: "Yes",
      adPoolCents: 5000,
      participantCount: 3,
      creatorId: maya.id,
    },
  });

  await prisma.marketEntry.createMany({
    data: [
      {
        userId: demo.id,
        marketId: openSports.id,
        choice: "Rivera",
        feePaid: 10,
        activityScore: 2,
      },
      {
        userId: ken.id,
        marketId: openSports.id,
        choice: "Okoye",
        feePaid: 10,
        activityScore: 1,
      },
      {
        userId: demo.id,
        marketId: openTech.id,
        choice: "Yes",
        feePaid: 10,
        activityScore: 1,
      },
      {
        userId: demo.id,
        marketId: resolved.id,
        choice: "Yes",
        feePaid: 10,
        isCorrect: true,
        activityScore: 3,
      },
      {
        userId: ken.id,
        marketId: resolved.id,
        choice: "No",
        feePaid: 10,
        isCorrect: false,
        activityScore: 1,
      },
      {
        userId: maya.id,
        marketId: resolved.id,
        choice: "Yes",
        feePaid: 10,
        isCorrect: true,
        activityScore: 2,
      },
    ],
  });

  // Pre-seed payouts for the resolved market
  await prisma.revenuePayout.createMany({
    data: [
      {
        marketId: resolved.id,
        role: "PLATFORM",
        userId: null,
        amountCents: 2000,
        shareBps: 4000,
        note: "Betme platform share",
      },
      {
        marketId: resolved.id,
        role: "CREATOR",
        userId: maya.id,
        amountCents: 1250,
        shareBps: 2500,
        note: "Prediction creator share",
      },
      {
        marketId: resolved.id,
        role: "ACCURATE",
        userId: demo.id,
        amountCents: 750,
        shareBps: 2500,
        note: "Accurate predictor share",
      },
      {
        marketId: resolved.id,
        role: "ACCURATE",
        userId: maya.id,
        amountCents: 500,
        shareBps: 2500,
        note: "Accurate predictor share",
      },
      {
        marketId: resolved.id,
        role: "PARTICIPANT",
        userId: demo.id,
        amountCents: 250,
        shareBps: 1000,
        note: "Participant ad share",
      },
      {
        marketId: resolved.id,
        role: "PARTICIPANT",
        userId: maya.id,
        amountCents: 167,
        shareBps: 1000,
        note: "Participant ad share",
      },
      {
        marketId: resolved.id,
        role: "PARTICIPANT",
        userId: ken.id,
        amountCents: 83,
        shareBps: 1000,
        note: "Participant ad share",
      },
    ],
  });

  console.log("Seeded Betme demo data");
  console.log("Login: demo@betme.app / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
