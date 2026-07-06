import mongoose from 'mongoose';

const donorNotificationSchema = new mongoose.Schema(
  {
    donor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Donor', 
      required: true, 
      index: true 
    },
    type: {
      type: String,
      enum: ['donation', 'saved_campaign', 'follow', 'badge', 'profile_change', 'new_campaign'],
      required: true,
    },
    title: { 
      type: String, 
      required: true 
    },
    detail: { 
      type: String, 
      required: true 
    },
    category: {
      type: String,
      enum: ['Payment', 'Activity', 'Badge', 'Message', 'Receipt'],
      default: 'Activity'
    },
    isRead: { 
      type: Boolean, 
      default: false, 
      index: true 
    },
    // Optional pointers
    relatedCampaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null },
    relatedCreator: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', default: null }
  },
  { timestamps: true }
);

donorNotificationSchema.index({ donor: 1, createdAt: -1 });

export default mongoose.model('DonorNotification', donorNotificationSchema);
