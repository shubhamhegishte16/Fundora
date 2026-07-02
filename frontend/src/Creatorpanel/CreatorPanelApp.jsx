import React, { useState } from 'react';
import AppShell from './components/shell/AppShell.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MyCampaigns from './pages/MyCampaigns.jsx';
import Donations from './pages/Donations.jsx';
import CreateCampaign from './pages/CreateCampaign.jsx';
import RewardsBadges from './pages/RewardsBadges.jsx';
import FollowingCreators from './pages/FollowingCreators.jsx';
import Community from './pages/Community.jsx';
import Notifications from './pages/Notifications.jsx';
import ProfileSettings from './pages/ProfileSettings.jsx';

// Each entry: the page component + the title/subtitle shown in TopBar.
const PAGES = {
  dashboard: { component: Dashboard, title: 'Welcome back, Arjun!', subtitle: "Here's what happening with your campaign today" },
  campaigns: { component: MyCampaigns, title: 'My Campaigns', subtitle: 'Manage and track all your fundraising campaigns' },
  donations: { component: Donations, title: 'Donations', subtitle: 'Every contribution to your campaigns, in one place' },
  create: { component: CreateCampaign, title: 'Create Campaign', subtitle: 'Launch a new campaign and start raising funds' },
  rewards: { component: RewardsBadges, title: 'Rewards & Badges', subtitle: 'Track your progress and unlock new milestones' },
  following: { component: FollowingCreators, title: 'Following Creators', subtitle: 'Organizations and creators you support' },
  community: { component: Community, title: 'Community', subtitle: 'Updates and discussions from creators you follow' },
  notifications: { component: Notifications, title: 'Notifications', subtitle: 'Stay up to date with your campaign activity' },
  settings: { component: ProfileSettings, title: 'Profile Settings', subtitle: 'Manage your account and preferences' },
};

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  // Set alongside a navigate('create') call when editing an existing campaign
  // (see MyCampaigns.jsx's Edit button). Cleared whenever we navigate anywhere else.
  const [editingCampaignId, setEditingCampaignId] = useState(null);

  const navigate = (page, options = {}) => {
    setEditingCampaignId(page === 'create' ? options.campaignId || null : null);
    setActivePage(page);
  };

  const { component: PageComponent, title, subtitle } = PAGES[activePage];
  const isCreatePage = activePage === 'create';

  return (
    <AppShell
      activePage={activePage}
      onNavigate={navigate}
      title={isCreatePage && editingCampaignId ? 'Edit Campaign' : title}
      subtitle={isCreatePage && editingCampaignId ? 'Update your campaign details' : subtitle}
    >
      {isCreatePage ? (
        <PageComponent campaignId={editingCampaignId} onNavigate={navigate} />
      ) : (
        <PageComponent onNavigate={navigate} />
      )}
    </AppShell>
  );
}
