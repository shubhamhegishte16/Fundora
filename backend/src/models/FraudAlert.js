import mongoose from 'mongoose';

/**
 * FraudAlert
 * A flagged event that needs admin review. Rows can be created two ways:
 *  - automatically, by the heuristics in utils/fraudDetection.js (flaggedBy: null)
 *  - manually, by an admin looking at a donation/campaign/user (flaggedBy: Admin._id)
 *
 * `entityType` + the matching related* field form a light polymorphic
 * reference so one alert list can cover donations, campaigns, and users
 * without needing a separate collection per entity type.
 */
const fraudAlertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'large_donation',
        'rapid_donations',
        'duplicate_payment_info',
        'suspicious_campaign',
        'multiple_accounts',
        'unusual_refund_pattern',
        'manual',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'dismissed'],
      default: 'open',
      index: true,
    },

    title: { type: String, required: true },
    description: { type: String, required: true },

    entityType: { type: String, enum: ['donation', 'campaign', 'user', 'creator'], required: true },
    relatedDonation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', default: null },
    relatedCampaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null },
    relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    relatedCreator: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', default: null },

    flaggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null }, // null = system/automatic
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    resolvedAt: { type: Date, default: null },
    resolutionNote: { type: String, default: null },
  },
  { timestamps: true }
);

fraudAlertSchema.index({ status: 1, createdAt: -1 });
fraudAlertSchema.index({ severity: 1, status: 1 });

export default mongoose.model('FraudAlert', fraudAlertSchema);