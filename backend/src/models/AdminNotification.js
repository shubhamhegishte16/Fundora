import mongoose from 'mongoose';

/**
 * AdminNotification
 * The admin inbox — separate collection from `Notification` (which is
 * creator-facing). Rows are inserted as side effects elsewhere (new
 * campaign submitted, new KYC submitted, fraud alert raised, etc. — see
 * utils/notifyAdmins.js) and shared across all admins rather than scoped
 * to one, since any admin picking up the queue should see the same list.
 */
const adminNotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'campaign_pending',
        'kyc_pending',
        'fraud_alert',
        'new_user',
        'large_donation',
        'system',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },

    relatedCampaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null },
    relatedCreator: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', default: null },
    relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    relatedDonation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', default: null },
    relatedFraudAlert: { type: mongoose.Schema.Types.ObjectId, ref: 'FraudAlert', default: null },

    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

adminNotificationSchema.index({ createdAt: -1 });
adminNotificationSchema.index({ isRead: 1, createdAt: -1 });

export default mongoose.model('AdminNotification', adminNotificationSchema);