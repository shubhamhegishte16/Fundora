import mongoose from 'mongoose';

/**
 * Notification
 * Always scoped to a single Creator (the only inbox this backend
 * serves). Rows are inserted by other services as side effects
 * (donation received, milestone crossed, new follower, new comment,
 * badge earned) — see src/services/notificationService.js. There's
 * no public "create notification" endpoint; only read + mark-read.
 */
const notificationSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true, index: true },

    type: {
      type: String,
      enum: ['donation', 'milestone', 'follow', 'comment', 'reward'],
      required: true,
    },
    title: { type: String, required: true },
    detail: { type: String, required: true },

    // Optional pointer back to whatever triggered this, for deep-linking from the UI.
    relatedCampaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null },
    relatedDonation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', default: null },
    relatedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost', default: null },

    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ creator: 1, createdAt: -1 });
notificationSchema.index({ creator: 1, isRead: 1 });

export default mongoose.model('Notification', notificationSchema);
