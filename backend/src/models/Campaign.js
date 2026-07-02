import mongoose from 'mongoose';

/**
 * Campaign
 * Owned by exactly one Creator. `raisedAmount` and `donorCount` are
 * denormalized counters updated whenever a donation lands against
 * this campaign (see Donation post-save hook) so dashboard/list
 * queries don't need to aggregate Donations on every read.
 */
const campaignSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true, index: true },

    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Education', 'Health', 'Environment', 'Disaster Relief', 'Animal Welfare', 'Community'],
    },
    coverImageUrl: { type: String, default: null },

    goalAmount: { type: Number, required: true, min: 0 },
    raisedAmount: { type: Number, default: 0, min: 0 }, // denormalized, kept in sync by Donation hooks
    donorCount: { type: Number, default: 0, min: 0 }, // denormalized

    status: {
      type: String,
      enum: ['draft', 'pending_review', 'active', 'completed'],
      default: 'draft',
      index: true,
    },
    startDate: { type: Date, default: null }, // set when status moves pending_review -> active
    endDate: { type: Date, default: null },

    // Admin review trail. rejectionReason is set (and status reverted to
    // 'draft') on rejection; cleared again once the creator resubmits.
    rejectionReason: { type: String, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Computed, not stored — always derive from the two source numbers.
campaignSchema.virtual('fundedPct').get(function () {
  if (!this.goalAmount) return 0;
  return Math.min(100, Math.round((this.raisedAmount / this.goalAmount) * 100));
});

campaignSchema.virtual('daysLeft').get(function () {
  if (!this.endDate || this.status !== 'active') return null;
  const diffMs = new Date(this.endDate) - new Date();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
});

campaignSchema.set('toJSON', { virtuals: true });
campaignSchema.set('toObject', { virtuals: true });

campaignSchema.index({ creator: 1, status: 1 });

export default mongoose.model('Campaign', campaignSchema);