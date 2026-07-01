import mongoose from 'mongoose';

/**
 * Badge
 * The fixed catalog of badges available in the system (seeded once,
 * rarely changes). `criteria` documents what a badge requires in a
 * structured way so the badge-progress service (see services/
 * badgeService.js) can compute earned/progress generically instead
 * of hardcoding a switch statement per badge.
 */
const badgeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g. "first-campaign", stable identifier
    label: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true }, // maps to a frontend Icon key, e.g. "Flag"

    criteria: {
      metric: {
        type: String,
        required: true,
        enum: ['campaignCount', 'supporterCount', 'followerCount', 'totalRaised', 'activeStreakMonths'],
      },
      target: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Badge', badgeSchema);
