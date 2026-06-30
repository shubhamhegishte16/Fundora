import React from 'react';
import { Icon } from '../icons.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { communityPosts } from '../data.js';

export default function Community() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <Card>
        <div className="flex items-start gap-3">
          <Avatar name="Arjun Sharma" tint="dark" />
          <textarea
            className="flex-1 resize-none rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            rows={2}
            placeholder="Share an update with your supporters..."
          />
        </div>
        <div className="mt-3 flex justify-end">
          <Button icon={Icon.Send} size="sm">Post Update</Button>
        </div>
      </Card>

      {communityPosts.map((post) => (
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
            <button className="flex items-center gap-1.5 hover:text-emerald-700">
              <Icon.ThumbsUp className="h-4 w-4" /> {post.likes}
            </button>
            <button className="flex items-center gap-1.5 hover:text-emerald-700">
              <Icon.MessageCircle className="h-4 w-4" /> {post.comments}
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
