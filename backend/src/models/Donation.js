import mongoose from 'mongoose';
import Campaign from './Campaign.js';

/**
 * Donation
 * Created by the donor-facing donation flow (see donationController.js /
 * POST /api/mock-donations) and read/aggregated everywhere else — creator
 * dashboard, donations list, badges, admin panel, donor's own history.
 * The post-save hook below keeps Campaign.raisedAmount/donorCount in sync
 * so those reads never need to re-aggregate on every request.
 */
const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true, index: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true, index: true }, // denormalized for fast creator-scoped queries

    amount: { type: Number, required: true, min: 1 },
    tip: { type: Number, default: 0, min: 0 }, // optional platform tip, added at donation time
    isAnonymous: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'completed', 'refunded'], default: 'completed', index: true },
    message: { type: String, trim: true, maxlength: 500 },

    // --- Added for the admin "Donations" panel ---
    method: {
      type: String,
      trim: true,
      default: 'Other', // free-form: donor UI sends labels like "Google Pay", "PhonePay", etc.
    },
    // Receipt identifiers generated at donation time — kept unique+sparse so
    // older/legacy rows without them (if any) don't collide.
    transactionId: { type: String, unique: true, sparse: true, index: true },
    receiptId: { type: String, unique: true, sparse: true },
    // Set when an admin refunds a completed donation (status -> 'refunded').
    refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    refundedAt: { type: Date, default: null },
    refundReason: { type: String, default: null },

    // Set the first time this donation gets swept up by a fraud heuristic
    // or manually flagged by an admin. Kept lightweight here — full detail
    // lives on the FraudAlert document itself.
    isFlagged: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

donationSchema.index({ creator: 1, createdAt: -1 });
donationSchema.index({ creator: 1, status: 1 });

// Auto-generate receipt identifiers if the caller didn't supply them.
// Synchronous, no `next` callback — Mongoose 7+ dropped callback-style
// middleware, so a `next` parameter here would not be a real function.
donationSchema.pre('save', function () {
  if (!this.transactionId) {
    this.transactionId = `TXN-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }
  if (!this.receiptId) {
    this.receiptId = `RCP-${Date.now().toString().slice(-8)}`;
  }
});

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