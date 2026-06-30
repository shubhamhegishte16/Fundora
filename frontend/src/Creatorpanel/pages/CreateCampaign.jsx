import React, { useState } from 'react';
import { Icon } from '../icons.jsx';
import Card, { CardHeader } from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';

const inputClass = 'w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100';
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700';

const CATEGORIES = ['Education', 'Health', 'Environment', 'Disaster Relief', 'Animal Welfare', 'Community'];

export default function CreateCampaign() {
  const [category, setCategory] = useState('Education');

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Card>
          <CardHeader title="Campaign Details" />
          <div className="mt-4 space-y-4">
            <div>
              <label className={labelClass}>Campaign Title</label>
              <input className={inputClass} placeholder="e.g. Empower Rural Education" />
            </div>
            <div>
              <label className={labelClass}>Organization Name</label>
              <input className={inputClass} placeholder="e.g. Teach India" />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      category === c ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea className={`${inputClass} min-h-[120px] resize-none`} placeholder="Tell donors what this campaign is about and the impact it will create..." />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Funding Goal" />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Target Amount (₹)</label>
              <input type="number" className={inputClass} placeholder="500000" />
            </div>
            <div>
              <label className={labelClass}>Campaign Duration (days)</label>
              <input type="number" className={inputClass} placeholder="30" />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Campaign Cover" />
          <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Icon.Upload className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-700">Drag and drop an image, or click to browse</p>
            <p className="text-xs text-slate-400">PNG or JPG, up to 5MB</p>
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader title="Preview" />
          <div className="mt-4">
            <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gradient-to-br from-emerald-200 to-teal-300">
              <div className="absolute inset-0 flex items-center justify-center text-emerald-900/40">
                <Icon.Image className="h-8 w-8" />
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">Your campaign title</p>
            <p className="text-xs text-slate-500">by Your organization</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-0 rounded-full bg-emerald-600" />
            </div>
            <p className="mt-1 text-[11px] font-medium text-emerald-700">0% funded</p>
          </div>
        </Card>

        <Card className="space-y-3">
          <Button className="w-full">Publish Campaign</Button>
          <Button variant="outline" className="w-full">Save as Draft</Button>
        </Card>
      </div>
    </div>
  );
}
