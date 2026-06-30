// Mock data layer for the whole app. Swap any of this for real API
// calls without touching component markup — every page reads from here.

export const creator = { name: 'Arjun Sharma', role: 'Creator' };

/* ---------------------------- Dashboard ---------------------------- */

export const statCards = [
  { id: 'funds', label: 'Total Funds raised', value: '₹8,25,000', delta: '+12% than last month', icon: 'HeartHand', tint: 'bg-emerald-50 text-emerald-700' },
  { id: 'donations', label: 'Total Donations', value: '276', delta: '+18.5% than last month', icon: 'Users', tint: 'bg-emerald-50 text-emerald-700' },
  { id: 'campaigns', label: 'Active campaign', value: '46', delta: null, icon: 'Leaf', tint: 'bg-slate-100 text-slate-500' },
  { id: 'supporters', label: 'Total supporters', value: '856', delta: '+24% than last month', icon: 'HeartHand', tint: 'bg-emerald-50 text-emerald-700' },
];

export const fundingPoints = [200, 420, 560, 640, 700, 980, 1450];
export const fundingLabels = ['16 May', '', '17 May', '', '18 May', '', '19 May'];

export const donationSegments = [
  { id: 'education', label: 'Education', value: 1000, color: '#059669' },
  { id: 'environment', label: 'Environment', value: 800, color: '#34d399' },
  { id: 'health', label: 'Health', value: 500, color: '#3b82f6' },
  { id: 'others', label: 'Others', value: 250, color: '#f2c14e' },
];
export const donationDisplayTotal = 2500;

/* --------------------------- My Campaigns --------------------------- */

export const allCampaigns = [
  { id: 'rural-education', title: 'Empower Rural Education', org: 'by Teach India', category: 'Education', status: 'active', fundedPct: 65, raised: 325000, goal: 500000, donors: 142, daysLeft: 12, theme: 'from-amber-200 to-orange-300' },
  { id: 'cancer-patients', title: 'Support Cancer Patients', org: 'by Hope Foundation', category: 'Health', status: 'active', fundedPct: 49, raised: 245000, goal: 500000, donors: 98, daysLeft: 21, theme: 'from-sky-200 to-blue-300' },
  { id: 'save-rivers', title: 'Save Our Rivers', org: 'by River Warriors', category: 'Environment', status: 'active', fundedPct: 90, raised: 450000, goal: 500000, donors: 211, daysLeft: 4, theme: 'from-emerald-200 to-teal-300' },
  { id: 'clean-water', title: 'Clean Water for All', org: 'by Jal Seva Trust', category: 'Health', status: 'active', fundedPct: 38, raised: 190000, goal: 500000, donors: 76, daysLeft: 30, theme: 'from-cyan-200 to-sky-300' },
  { id: 'girl-child', title: 'Educate a Girl Child', org: 'by Pratham Vidya', category: 'Education', status: 'completed', fundedPct: 100, raised: 500000, goal: 500000, donors: 318, daysLeft: 0, theme: 'from-violet-200 to-purple-300' },
  { id: 'tree-plantation', title: 'Urban Tree Plantation', org: 'by Green Mumbai', category: 'Environment', status: 'draft', fundedPct: 0, raised: 0, goal: 300000, donors: 0, daysLeft: null, theme: 'from-lime-200 to-green-300' },
];

/* ---------------------------- Donations ---------------------------- */

export const recentDonations = [
  { id: 1, name: 'Amit Sharma', campaign: 'Clean Water for All', amount: 2000, date: '28 Jun 2026', time: '2 hours ago', status: 'completed' },
  { id: 2, name: 'Priya Singh', campaign: 'Educate a Child', amount: 1500, date: '28 Jun 2026', time: '5 hours ago', status: 'completed' },
  { id: 3, name: 'Anonymous', campaign: 'Save Our Environment', amount: 5000, date: '27 Jun 2026', time: '1 day ago', status: 'completed' },
  { id: 4, name: 'Neha Verma', campaign: 'Clean Water for All', amount: 750, date: '27 Jun 2026', time: '1 day ago', status: 'completed' },
  { id: 5, name: 'Rohit Mehta', campaign: 'Empower Rural Education', amount: 3000, date: '26 Jun 2026', time: '2 days ago', status: 'completed' },
  { id: 6, name: 'Anonymous', campaign: 'Support Cancer Patients', amount: 1200, date: '26 Jun 2026', time: '2 days ago', status: 'pending' },
  { id: 7, name: 'Kavita Rao', campaign: 'Save Our Rivers', amount: 4500, date: '25 Jun 2026', time: '3 days ago', status: 'completed' },
  { id: 8, name: 'Sandeep Joshi', campaign: 'Empower Rural Education', amount: 600, date: '24 Jun 2026', time: '4 days ago', status: 'refunded' },
];

/* -------------------------- Rewards & Badges -------------------------- */

export const badges = [
  { id: 'first-campaign', label: 'First Campaign', desc: 'Launched your first campaign', icon: 'Flag', earned: true },
  { id: 'rising-star', label: 'Rising Star', desc: 'Reached 100 supporters', icon: 'Star', earned: true },
  { id: 'community-builder', label: 'Community Builder', desc: '50 followers gained', icon: 'Users', earned: true },
  { id: 'top-fundraiser', label: 'Top Fundraiser', desc: 'Raised over ₹5,00,000', icon: 'Trophy', earned: true },
  { id: 'consistency', label: 'Consistency King', desc: '6 months active streak', icon: 'Award', earned: false, progressPct: 70 },
  { id: 'mega-donor-magnet', label: 'Donor Magnet', desc: 'Attract 500 unique donors', icon: 'Gift', earned: false, progressPct: 45 },
];

export const rewardTier = { name: 'Gold Creator', points: 3200, nextTier: 'Platinum Creator', pointsToNext: 5000 };

/* ------------------------- Following Creators ------------------------- */

export const followingCreators = [
  { id: 1, name: 'Teach India', category: 'Education', campaigns: 12, followers: '4.2K', bio: 'Bringing quality education to rural India since 2014.' },
  { id: 2, name: 'Hope Foundation', category: 'Health', campaigns: 8, followers: '2.8K', bio: 'Supporting cancer patients and their families.' },
  { id: 3, name: 'River Warriors', category: 'Environment', campaigns: 5, followers: '1.9K', bio: 'Cleaning and protecting India\'s river ecosystems.' },
  { id: 4, name: 'Jal Seva Trust', category: 'Health', campaigns: 6, followers: '1.3K', bio: 'Clean drinking water for underserved communities.' },
  { id: 5, name: 'Pratham Vidya', category: 'Education', campaigns: 15, followers: '6.1K', bio: 'Girl-child education and scholarship programs.' },
  { id: 6, name: 'Green Mumbai', category: 'Environment', campaigns: 3, followers: '890', bio: 'Urban afforestation and green cover restoration.' },
];

/* ------------------------------ Community ------------------------------ */

export const communityPosts = [
  { id: 1, author: 'Hope Foundation', time: '3 hours ago', content: 'We just crossed 50% funding on the Cancer Patients campaign — thank you to everyone who shared and donated this week!', likes: 24, comments: 5 },
  { id: 2, author: 'Priya Singh', time: '6 hours ago', content: 'Volunteered at the rural education drive this weekend. Incredible to see the impact in person. Highly recommend joining the next one.', likes: 41, comments: 9 },
  { id: 3, author: 'River Warriors', time: '1 day ago', content: 'River cleanup #12 complete. 2.3 tonnes of waste removed from the Mithi river bank. Onward to the next stretch.', likes: 67, comments: 14 },
  { id: 4, author: 'Arjun Sharma', time: '2 days ago', content: 'Hit 90% funding on Save Our Rivers! A few days left to help us close the gap — every share helps.', likes: 35, comments: 6 },
];

/* --------------------------- Notifications --------------------------- */

export const notifications = [
  { id: 1, type: 'donation', title: 'New donation received', detail: 'Amit Sharma donated ₹2,000 to "Clean Water for All"', time: '2 hours ago', read: false },
  { id: 2, type: 'milestone', title: 'Funding milestone reached', detail: '"Save Our Rivers" just crossed 90% of its goal', time: '5 hours ago', read: false },
  { id: 3, type: 'follow', title: 'New follower', detail: 'Hope Foundation started following you', time: '1 day ago', read: false },
  { id: 4, type: 'comment', title: 'New comment on your post', detail: 'Priya Singh commented on your community update', time: '1 day ago', read: true },
  { id: 5, type: 'reward', title: 'Badge earned', detail: 'You unlocked the "Top Fundraiser" badge', time: '3 days ago', read: true },
  { id: 6, type: 'donation', title: 'New donation received', detail: 'Anonymous donated ₹5,000 to "Save Our Environment"', time: '4 days ago', read: true },
];

/* ---------------------------- Profile Settings ---------------------------- */

export const profile = {
  name: 'Arjun Sharma',
  role: 'Creator',
  email: 'arjun.sharma@example.com',
  phone: '+91 98765 43210',
  location: 'Mumbai, Maharashtra',
  bio: 'Passionate about education and environmental causes. Running campaigns to bring measurable change to underserved communities.',
};

export const notificationPrefs = [
  { id: 'donations', label: 'New donations', desc: 'Get notified when someone donates to your campaign', enabled: true },
  { id: 'milestones', label: 'Funding milestones', desc: 'Get notified when a campaign crosses a funding milestone', enabled: true },
  { id: 'followers', label: 'New followers', desc: 'Get notified when someone follows you', enabled: false },
  { id: 'community', label: 'Community activity', desc: 'Comments and likes on your posts', enabled: true },
];
