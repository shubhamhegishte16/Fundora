import CommunityPost from '../models/CommunityPost.js';
import CommunityLike from '../models/CommunityLike.js';

function relativeTime(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

// ─── GET /api/creator/community/posts ───────────────────────────────────────
export const getCommunityPosts = async (req, res) => {
  try {
    const creatorId = req.user._id;

    const posts = await CommunityPost.find({ creator: creatorId, isRemoved: false })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(50)
      .populate('authorId', 'name');

    // Which of these posts has the current creator already liked?
    const likedRows = await CommunityLike.find({
      post: { $in: posts.map((p) => p._id) },
      authorType: 'creator',
      authorId: creatorId,
    });
    const likedPostIds = new Set(likedRows.map((l) => String(l.post)));

    res.json({
      success: true,
      posts: posts.map((p) => ({
        id: p._id,
        author: p.authorId?.name || 'Unknown',
        authorType: p.authorType,
        time: relativeTime(p.createdAt),
        content: p.content,
        likes: p.likeCount,
        comments: p.commentCount,
        likedByMe: likedPostIds.has(String(p._id)),
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/creator/community/posts ──────────────────────────────────────
export const createCommunityPost = async (req, res) => {
  try {
    const { content, postType } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Post content is required' });
    }

    const post = await CommunityPost.create({
      authorType: 'creator',
      authorId: req.user._id,
      creator: req.user._id,
      content: content.trim(),
      postType: postType || 'update',
    });

    res.status(201).json({
      success: true,
      post: {
        id: post._id,
        author: req.user.name,
        authorType: 'creator',
        time: 'just now',
        content: post.content,
        likes: 0,
        comments: 0,
        likedByMe: false,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/creator/community/posts/:id/like ─────────────────────────────
// Toggles the current creator's like on a post.
export const toggleCommunityPostLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const creatorId = req.user._id;

    const existing = await CommunityLike.findOne({ post: postId, authorType: 'creator', authorId: creatorId });

    if (existing) {
      await existing.deleteOne();
      const post = await CommunityPost.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } }, { new: true });
      return res.json({ success: true, liked: false, likes: post?.likeCount ?? 0 });
    }

    await CommunityLike.create({ post: postId, authorType: 'creator', authorId: creatorId });
    const post = await CommunityPost.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } }, { new: true });
    res.json({ success: true, liked: true, likes: post?.likeCount ?? 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
