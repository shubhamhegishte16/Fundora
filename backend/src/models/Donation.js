import mongoose from 'mongoose';
import Campaign from './Campaign.js';

/**
 * Donation
 * Written by the donor-facing app (out of scope for this backend) —
 * the creator panel only ever reads/filters/aggregates these. We
 * still define the full model + a creation helper here because (a)
 * the creator panel's dashboard/donation-summary endpoints depend on
 * its shape, and (b) keeping the Campaign-sync hooks colocated with
 * the schema avoids a second codebase silently drifting out of sync
 * with this one.
 */
const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true, index: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true, index: true }, // denormalized for fast creator-scoped queries

    amount: { type: Number, required: true, min: 1 },
    isAnonymous: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'completed', 'refunded'], default: 'completed', index: true },
    message: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

donationSchema.index({ creator: 1, createdAt: -1 });
donationSchema.index({ creator: 1, status: 1 });

/**
 * Keep Campaign.raisedAmount / donorCount in sync whenever a
 * completed donation is created. Only counts `completed` status —
 * pending/refunded donations don't contribute to campaign totals.
 */
donationSchema.post('save', async function (doc) {
  if (doc.status !== 'completed') return;

  const isFirstDonationFromThisDonor = (await mongoose.model('Donation').countDocuments({
    campaign: doc.campaign,
    donor: doc.donor,
    status: 'completed',
  })) === 1;

  await Campaign.findByIdAndUpdate(doc.campaign, {
    $inc: {
      raisedAmount: doc.amount,
      donorCount: isFirstDonationFromThisDonor ? 1 : 0,
    },
  });
});

export default mongoose.model('Donation', donationSchema);
