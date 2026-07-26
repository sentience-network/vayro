import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BADGE_CATALOG, CREDIT_REWARDS } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  await prisma.videoParticipant.deleteMany();
  await prisma.videoRoom.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.revenuePayout.deleteMany();
  await prisma.adView.deleteMany();
  await prisma.marketEntry.deleteMany();
  await prisma.creditLedger.deleteMany();
  await prisma.market.deleteMany();
  await prisma.user.deleteMany();
  await prisma.platformConfig.deleteMany();

  await prisma.platformConfig.create({ data: { id: "default" } });

  for (const badge of BADGE_CATALOG) {
    await prisma.badge.create({ data: { ...badge } });
  }

  const passwordHash = await bcrypt.hash("demo1234", 10);

  const demo = await prisma.user.create({
    data: {
      email: "demo@betme.app",
      username: "demo",
      displayName: "Demo Player",
      bio: "Chasing sharp calls and sharing the ones that move.",
      avatarHue: 155,
      passwordHash,
      credits: CREDIT_REWARDS.signup + 90,
      accuracyScore: 0.67,
      totalPredictions: 6,
      correctPredictions: 4,
      creatorScore: 40,
      referralCode: "DEMOPLAY",
      creditLedger: {
        create: [
          { amount: CREDIT_REWARDS.signup, reason: "signup_bonus" },
          { amount: 15, reason: "daily_bonus" },
          { amount: 25, reason: "create_market_bonus" },
          { amount: 50, reason: "referral_bonus" },
        ],
      },
    },
  });

  const maya = await prisma.user.create({
    data: {
      email: "maya@betme.app",
      username: "maya",
      displayName: "Maya Voss",
      bio: "Creator energy. I post markets people actually join.",
      avatarHue: 28,
      passwordHash,
      credits: 180,
      accuracyScore: 0.8,
      totalPredictions: 10,
      correctPredictions: 8,
      creatorScore: 120,
      referralCode: "MAYAVOSS",
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
      bio: "Tech culture caller. Always in the comments.",
      avatarHue: 210,
      passwordHash,
      credits: 120,
      accuracyScore: 0.55,
      totalPredictions: 9,
      correctPredictions: 5,
      creatorScore: 55,
      referralCode: "KENJIPK",
      referredById: demo.id,
      creditLedger: {
        create: [
          { amount: CREDIT_REWARDS.signup, reason: "signup_bonus" },
          { amount: CREDIT_REWARDS.referredSignup, reason: "referred_signup_bonus" },
        ],
      },
    },
  });

  const badges = await prisma.badge.findMany();
  const byKey = Object.fromEntries(badges.map((b) => [b.key, b.id]));

  await prisma.userBadge.createMany({
    data: [
      { userId: demo.id, badgeId: byKey.welcome_caller },
      { userId: demo.id, badgeId: byKey.first_call },
      { userId: demo.id, badgeId: byKey.sharp_eye },
      { userId: demo.id, badgeId: byKey.signal_booster },
      { userId: maya.id, badgeId: byKey.welcome_caller },
      { userId: maya.id, badgeId: byKey.oracle },
      { userId: maya.id, badgeId: byKey.crowd_magnet },
      { userId: ken.id, badgeId: byKey.welcome_caller },
      { userId: ken.id, badgeId: byKey.first_call },
      { userId: ken.id, badgeId: byKey.social_spark },
    ],
  });

  await prisma.follow.createMany({
    data: [
      { followerId: demo.id, followingId: maya.id },
      { followerId: demo.id, followingId: ken.id },
      { followerId: ken.id, followingId: maya.id },
      { followerId: maya.id, followingId: demo.id },
    ],
  });

  const inSevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const openSports = await prisma.market.create({
    data: {
      slug: "summer-finals-mvp-race",
      title: "Who takes Summer Finals MVP?",
      description:
        "Social prediction on the finals MVP. Watch a short partner ad, spend a flat credit fee, and pick your call.",
      category: "Sports",
      optionsJson: JSON.stringify(["Rivera", "Okoye", "Chen", "Other"]),
      entryFee: 10,
      status: "OPEN",
      resolvesAt: inSevenDays,
      adPoolCents: 4200,
      participantCount: 2,
      shareCount: 14,
      creatorId: maya.id,
    },
  });

  const openTech = await prisma.market.create({
    data: {
      slug: "next-gadget-drop-week",
      title: "Will the next flagship drop this week?",
      description:
        "A culture-tech call with a flat entry fee in Betme credits. Credits are earned, never bought.",
      category: "Tech",
      optionsJson: JSON.stringify(["Yes", "No"]),
      entryFee: 10,
      status: "OPEN",
      resolvesAt: inThreeDays,
      adPoolCents: 1850,
      participantCount: 1,
      shareCount: 6,
      creatorId: ken.id,
    },
  });

  const openCulture = await prisma.market.create({
    data: {
      slug: "city-marathon-sellout",
      title: "City marathon sold out by Friday?",
      description: "Crowd heat check. Share it, follow the poster, and call it with earned credits.",
      category: "Culture",
      optionsJson: JSON.stringify(["Yes", "No"]),
      entryFee: 10,
      status: "OPEN",
      resolvesAt: inThreeDays,
      adPoolCents: 960,
      participantCount: 0,
      shareCount: 3,
      creatorId: demo.id,
    },
  });

  const resolved = await prisma.market.create({
    data: {
      slug: "festival-headliner-surprise",
      title: "Surprise festival headliner?",
      description: "Resolved demo market showing the ad revenue waterfall.",
      category: "Entertainment",
      optionsJson: JSON.stringify(["Yes", "No"]),
      entryFee: 10,
      status: "RESOLVED",
      resolvesAt: yesterday,
      resolvedOption: "Yes",
      adPoolCents: 5000,
      participantCount: 3,
      shareCount: 22,
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

  await prisma.revenuePayout.createMany({
    data: [
      {
        marketId: resolved.id,
        role: "PLATFORM",
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

  const conversation = await prisma.conversation.create({
    data: {
      isGroup: false,
      members: {
        create: [{ userId: demo.id }, { userId: maya.id }],
      },
      messages: {
        create: [
          {
            senderId: maya.id,
            body: "You in on the Finals MVP market? Rivera looks locked.",
          },
          {
            senderId: demo.id,
            body: "Already called Rivera. Want to hop on a quick video debate?",
          },
        ],
      },
    },
  });

  // touch unused vars for clarity in seed logs
  void openCulture;
  void conversation;

  console.log("Seeded Betme social demo data");
  console.log("Login: demo@betme.app / demo1234");
  console.log("Referral codes: DEMOPLAY, MAYAVOSS, KENJIPK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
