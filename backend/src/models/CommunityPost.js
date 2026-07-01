import mongoose from 'mongoose';

/**
 * CommunityPost
 * `authorType` + `authorId` form a polymorphic reference since both
 * Creators and Donors can post (per spec: creators post updates/
 * milestones/announcements, donors mostly comment but can also post
 * questions). `postType` only really applies to creator posts;
 * donor posts default to 'discussion'.
 */
const communityPostSchema = new mongoose.Schema(
  {
    authorType: { type: String, enum: ['creator', 'donor'], required: true },
    authorModel: { type: String, enum: ['Creator', 'Donor'], required: true }, // mirrors authorType, set automatically below — needed because refPath requires a real stored field
    authorId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'authorModel' },

    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true, index: true }, // which creator's community this post belongs to
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null }, // optional: post tied to a specific campaign

    postType: { type: String, enum: ['update', 'milestone', 'announcement', 'discussion'], default: 'discussion' },
    content: { type: String, required: true, trim: true, maxlength: 2000 },

    isPinned: { type: Boolean, default: false },
    isRemoved: { type: Boolean, default: false }, // soft-delete for moderation
    removedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', default: null },

    likeCount: { type: Number, default: 0 }, // denormalized
    commentCount: { type: Number, default: 0 }, // denormalized
  },
  { timestamps: true }
);

// Keeps authorModel in sync with authorType so callers only ever need to set authorType.
communityPostSchema.pre('validate', function (next) {
  this.authorModel = this.authorType === 'creator' ? 'Creator' : 'Donor';
  next();
});

communityPostSchema.index({ creator: 1, createdAt: -1 });

export default mongoose.model('CommunityPost', communityPostSchema);
