import React from 'react';
import { Icon } from '../icons.jsx';
import Card from '../components/ui/Card.jsx';
import Pill from '../components/ui/Pill.jsx';
import Button from '../components/ui/Button.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { followingCreators } from '../data.js';

export default function FollowingCreators() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {followingCreators.map((c) => (
        <Card key={c.id} className="flex flex-col">
          <div className="flex items-start gap-3">
            <Avatar name={c.name} size="xl" tint="dark" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
              <Pill tint="emerald" className="mt-1">{c.category}</Pill>
            </div>
          </div>

          <p className="mt-3 flex-1 text-sm text-slate-500">{c.bio}</p>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Icon.Flag className="h-3.5 w-3.5" />{c.campaigns} campaigns</span>
            <span className="flex items-center gap-1"><Icon.Users className="h-3.5 w-3.5" />{c.followers} followers</span>
          </div>

          <Button variant="outline" className="mt-4 w-full" icon={Icon.UserCheck}>Following</Button>
        </Card>
      ))}
    </div>
  );
}
