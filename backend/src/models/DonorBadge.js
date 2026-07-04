// src/models/DonorBadge.js
import mongoose from 'mongoose';

const donorBadgeSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
    },
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge',
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    isDisplayed: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

donorBadgeSchema.index({ donor: 1, badge: 1 }, { unique: true });

const DonorBadge = mongoose.model('DonorBadge', donorBadgeSchema);
export default DonorBadge;