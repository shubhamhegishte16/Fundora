import mongoose from 'mongoose';

/**
 * CommunityComment
 * Same polymorphic author pattern as CommunityPost. `parentComment`
 * lets a creator reply directly to a donor's comment (one level of
 * nesting — keeps moderation and rendering simple).
 */
const communityCommentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost', required: true, index: true },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityComment', default: null },

    authorType: { type: String, enum: ['creator', 'donor'], required: true },
    authorModel: { type: String, enum: ['Creator', 'Donor'], required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'authorModel' },

    content: { type: String, required: true, trim: true, maxlength: 1000 },

    isRemoved: { type: Boolean, default: false }, // soft-delete for moderation
    removedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', default: null },
  },
  { timestamps: true }
);

communityCommentSchema.pre('validate', function (next) {
  this.authorModel = this.authorType === 'creator' ? 'Creator' : 'Donor';
  next();
});

communityCommentSchema.index({ post: 1, createdAt: 1 });

export default mongoose.model('CommunityComment', communityCommentSchema);
