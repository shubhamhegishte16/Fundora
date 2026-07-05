import React, { useState, useEffect } from 'react';
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
import { getMyProfile } from '../../services/profileService.js';

// Each entry: the page component + the title/subtitle shown in TopBar.
// `dashboard`'s title is overridden below once the real creator name loads.
const PAGES = {
  dashboard: { component: Dashboard, title: 'Welcome back!', subtitle: "Here's what happening with your campaign today" },
  campaigns: { component: MyCampaigns, title: 'My Campaigns', subtitle: 'Manage and track all your fundraising campaigns' },
  donations: { component: Donations, title: 'Donations', subtitle: 'Every contribution to your campaigns, in one place' },
  create: { component: CreateCampaign, title: 'Create Campaign', subtitle: 'Launch a new campaign and start raising funds' },
  rewards: { component: RewardsBadges, title: 'Rewards & Badges', subtitle: 'Track your progress and unlock new milestones' },
  following: { component: FollowingCreators, title: 'Your Followers', subtitle: 'Donors who follow your campaigns' },
  community: { component: Community, title: 'Community', subtitle: 'Updates and discussions from creators you follow' },
  notifications: { component: Notifications, title: 'Notifications', subtitle: 'Stay up to date with your campaign activity' },
  settings: { component: ProfileSettings, title: 'Profile Settings', subtitle: 'Manage your account and preferences' },
};

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  // Set alongside a navigate('create') call when editing an existing campaign
  // (see MyCampaigns.jsx's Edit button). Cleared whenever we navigate anywhere else.
  const [editingCampaignId, setEditingCampaignId] = useState(null);

  // Real logged-in creator's name/role — was previously hardcoded to "Arjun
  // Sharma" in TopBar.jsx. Fetched once here and threaded down to AppShell.
  const [creator, setCreator] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getMyProfile();
        if (isMounted) setCreator(data.creator);
      } catch (err) {
        // Non-fatal — TopBar falls back to "Loading…" / "Creator" if this fails.
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const navigate = (page, options = {}) => {
    setEditingCampaignId(page === 'create' ? options.campaignId || null : null);
    setActivePage(page);
  };

  const { component: PageComponent, title, subtitle } = PAGES[activePage];
  const isCreatePage = activePage === 'create';
  const isDashboard = activePage === 'dashboard';

  const firstName = creator?.name?.split(' ')[0];

  return (
    <AppShell
      activePage={activePage}
      onNavigate={navigate}
      title={
        isCreatePage && editingCampaignId
          ? 'Edit Campaign'
          : isDashboard && firstName
            ? `Welcome back, ${firstName}!`
            : title
      }
      subtitle={isCreatePage && editingCampaignId ? 'Update your campaign details' : subtitle}
      creatorName={creator?.name}
      creatorRole={creator?.role}
    >
      {isCreatePage ? (
        <PageComponent campaignId={editingCampaignId} onNavigate={navigate} />
      ) : (
        <PageComponent onNavigate={navigate} />
      )}
    </AppShell>
  );
}