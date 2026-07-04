import React, { useState, useEffect } from 'react';
import { Icon } from '../icons.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { getCommunityPosts, createCommunityPost, toggleCommunityPostLike } from '../../../services/communityService.js';

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);

  const load = async () => {
    try {
      const data = await getCommunityPosts();
      setPosts(data.posts || []);
    } catch (err) {
      setError('Could not load the community feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handlePost = async () => {
    if (!draft.trim()) return;
    setPosting(true);
    try {
      const data = await createCommunityPost(draft.trim());
      setPosts((prev) => [data.post, ...prev]);
      setDraft('');
    } catch (err) {
      setError('Could not publish your update. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    setPosts((prev) => prev.map((p) => (p.id === postId
      ? { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) }
      : p)));
    try {
      await toggleCommunityPostLike(postId);
    } catch (err) {
      // revert on failure
      setPosts((prev) => prev.map((p) => (p.id === postId
        ? { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) }
        : p)));
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <Card>
        <div className="flex items-start gap-3">
          <Avatar name="You" tint="dark" />
          <textarea
            className="flex-1 resize-none rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            rows={2}
            placeholder="Share an update with your supporters..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        </div>
        <div className="mt-3 flex justify-end">
          <Button icon={Icon.Send} size="sm" disabled={posting || !draft.trim()} onClick={handlePost}>
            {posting ? 'Posting…' : 'Post Update'}
          </Button>
        </div>
      </Card>

      {loading && (
        <Card className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-sm font-medium text-slate-500">Loading community feed…</p>
        </Card>
      )}

      {!loading && error && (
        <Card className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-sm font-medium text-rose-500">{error}</p>
        </Card>
      )}

      {!loading && !error && posts.length === 0 && (
        <Card className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-sm font-medium text-slate-500">No updates yet — share the first one!</p>
        </Card>
      )}

      {!loading && !error && posts.map((post) => (
        <Card key={post.id}>
          <div className="flex items-center gap-3">
            <Avatar name={post.author} />
            <div>
              <p className="text-sm font-semibold text-slate-900">{post.author}</p>
              <p className="text-xs text-slate-400">{post.time}</p>
            </div>
          </div>

          <p className="mt-3 text-sm text-slate-700">{post.content}</p>

          <div className="mt-4 flex items-center gap-5 border-t border-slate-100 pt-3 text-xs font-medium text-slate-500">
            <button
              onClick={() => handleLike(post.id)}
              className={`flex items-center gap-1.5 hover:text-emerald-700 ${post.likedByMe ? 'text-emerald-700' : ''}`}
            >
              <Icon.ThumbsUp className="h-4 w-4" /> {post.likes}
            </button>
            <span className="flex items-center gap-1.5">
              <Icon.MessageCircle className="h-4 w-4" /> {post.comments}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
