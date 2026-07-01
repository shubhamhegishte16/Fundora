import mongoose from 'mongoose';

/**
 * Follow
 * A donor following a creator (org). Created from the donor-facing
 * app; the creator panel only reads this (Followers page + dashboard
 * follower stats). One row per donor-creator pair, enforced by the
 * compound unique index below.
 */
const followSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true, index: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true, index: true },
  },
  { timestamps: true } // createdAt = "followed since"
);

followSchema.index({ donor: 1, creator: 1 }, { unique: true });
followSchema.index({ creator: 1, createdAt: -1 }); // for "recent followers" + growth queries

export default mongoose.model('Follow', followSchema);
