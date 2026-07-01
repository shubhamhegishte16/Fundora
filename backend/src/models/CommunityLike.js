import mongoose from 'mongoose';

/**
 * CommunityLike
 * One row per (post, author) reaction. Kept separate from the post
 * itself (rather than an array on the post doc) so we can enforce
 * "one like per user" via a unique index and avoid unbounded array
 * growth on popular posts.
 */
const communityLikeSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost', required: true, index: true },
    authorType: { type: String, enum: ['creator', 'donor'], required: true },
    authorModel: { type: String, enum: ['Creator', 'Donor'], required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'authorModel' },
  },
  { timestamps: true }
);

communityLikeSchema.pre('validate', function (next) {
  this.authorModel = this.authorType === 'creator' ? 'Creator' : 'Donor';
  next();
});

communityLikeSchema.index({ post: 1, authorType: 1, authorId: 1 }, { unique: true });

export default mongoose.model('CommunityLike', communityLikeSchema);
