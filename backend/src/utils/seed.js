import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Creator from '../models/Creator.js';
import Donor from '../models/Donor.js';
import Badge from '../models/Badge.js';

/**
 * Seed script — foundation data only (Creator account + a few Donors
 * + the Badge catalog). Run with `npm run seed`. Re-running is safe:
 * it upserts rather than duplicating. Campaign/Donation/etc. seed
 * data will be added here as each resource is built.
 */

const CREATOR_SEED = {
  orgName: 'Teach India',
  contactName: 'Arjun Sharma',
  email: 'arjun@teachindia.org',
  password: 'password123', // dev-only credential, see authController.devLogin
  phone: '+91 98765 43210',
  location: 'Mumbai, Maharashtra',
  bio: 'Passionate about education and environmental causes. Running campaigns to bring measurable change to underserved communities.',
  category: 'Education',
};

const DONOR_SEEDS = [
  { name: 'Amit Sharma', email: 'amit.sharma@example.com' },
  { name: 'Priya Singh', email: 'priya.singh@example.com' },
  { name: 'Neha Verma', email: 'neha.verma@example.com' },
  { name: 'Rohit Mehta', email: 'rohit.mehta@example.com' },
  { name: 'Kavita Rao', email: 'kavita.rao@example.com' },
  { name: 'Sandeep Joshi', email: 'sandeep.joshi@example.com' },
];

const BADGE_SEEDS = [
  { key: 'first-campaign', label: 'First Campaign', description: 'Launched your first campaign', icon: 'Flag', criteria: { metric: 'campaignCount', target: 1 } },
  { key: 'rising-star', label: 'Rising Star', description: 'Reached 100 supporters', icon: 'Star', criteria: { metric: 'supporterCount', target: 100 } },
  { key: 'community-builder', label: 'Community Builder', description: '50 followers gained', icon: 'Users', criteria: { metric: 'followerCount', target: 50 } },
  { key: 'top-fundraiser', label: 'Top Fundraiser', description: 'Raised over ₹5,00,000', icon: 'Trophy', criteria: { metric: 'totalRaised', target: 500000 } },
  { key: 'consistency', label: 'Consistency King', description: '6 months active streak', icon: 'Award', criteria: { metric: 'activeStreakMonths', target: 6 } },
  { key: 'donor-magnet', label: 'Donor Magnet', description: 'Attract 500 unique donors', icon: 'Gift', criteria: { metric: 'supporterCount', target: 500 } },
];

async function seed() {
  await connectDB();

  // --- Creator ---------------------------------------------------
  let creator = await Creator.findOne({ email: CREATOR_SEED.email });
  if (!creator) {
    const passwordHash = await Creator.hashPassword(CREATOR_SEED.password);
    creator = await Creator.create({ ...CREATOR_SEED, passwordHash });
    console.log(`[seed] created creator: ${creator.email} (password: ${CREATOR_SEED.password})`);
  } else {
    console.log(`[seed] creator already exists: ${creator.email}`);
  }

  // --- Donors ------------------------------------------------------
  for (const d of DONOR_SEEDS) {
    await Donor.updateOne({ email: d.email }, { $setOnInsert: d }, { upsert: true });
  }
  console.log(`[seed] ensured ${DONOR_SEEDS.length} donors`);

  // --- Badge catalog ------------------------------------------------
  for (const b of BADGE_SEEDS) {
    await Badge.updateOne({ key: b.key }, { $set: b }, { upsert: true });
  }
  console.log(`[seed] ensured ${BADGE_SEEDS.length} badges`);

  console.log('[seed] done.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
