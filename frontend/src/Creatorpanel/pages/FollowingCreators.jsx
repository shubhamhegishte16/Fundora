import React, { useState, useEffect } from 'react';
import { Icon } from '../icons.jsx';
import Card from '../components/ui/Card.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { getMyFollowers } from '../../../services/followerService.js';
import { Heart, Users, Loader, UserCheck, Coins, RefreshCw, User } from 'lucide-react';

function timeAgo(dateStr) {
  if (!dateStr) return 'recently';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

export default function FollowingCreators() {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalFollowers: 0,
    totalDonations: 0,
    avgDonation: 0,
  });

  const fetchFollowers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyFollowers();
      
      // Extract followers from response
      let followersList = [];
      if (response?.followers) {
        followersList = response.followers;
      } else if (response?.data?.followers) {
        followersList = response.data.followers;
      }
      
      setFollowers(followersList);
      
      // Calculate stats
      const totalDonations = followersList.reduce((sum, f) => sum + (f.totalDonated || f.totalDonations || 0), 0);
      const avgDonation = followersList.length > 0 ? totalDonations / followersList.length : 0;
      
      setStats({
        totalFollowers: followersList.length,
        totalDonations: totalDonations,
        avgDonation: avgDonation,
      });
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Could not load followers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader className="h-8 w-8 text-[#00a86b] animate-spin" />
        <span className="ml-3 text-sm text-gray-500">Loading followers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
          <Users className="h-8 w-8 text-red-400" />
        </div>
        <p className="mt-4 text-sm font-medium text-red-600">{error}</p>
        <button 
          onClick={fetchFollowers}
          className="mt-3 text-sm text-[#00a86b] hover:text-[#00965e] font-medium flex items-center gap-1 mx-auto"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  if (followers.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
          <Users className="h-8 w-8 text-gray-400" />
        </div>
        <p className="mt-4 text-sm font-medium text-gray-700">No followers yet</p>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          They'll show up here once donors start following you. 
          Share your campaigns to grow your following!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <Users className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Followers</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalFollowers}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Coins className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Donations</p>
            <p className="text-2xl font-bold text-gray-900">₹{stats.totalDonations.toLocaleString()}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Heart className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Avg Donation</p>
            <p className="text-2xl font-bold text-gray-900">₹{Math.round(stats.avgDonation).toLocaleString()}</p>
          </div>
        </Card>
      </div>

      {/* Followers Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Your Followers</h2>
          <span className="text-sm text-gray-500">
            {followers.length} follower{followers.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {followers.map((follower, index) => {
            // Get name from various possible fields
            const displayName = follower.name || follower.firstName || 'Anonymous Donor';
            const fullName = follower.firstName && follower.lastName 
              ? `${follower.firstName} ${follower.lastName}` 
              : displayName;
            
            // Get donation stats
            const totalDonated = follower.totalDonated || follower.totalDonations || 0;
            const donationCount = follower.donationCount || follower.donations || 0;
            
            return (
              <div 
                key={follower.id || follower._id || index} 
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center gap-3">
                  <Avatar 
                    name={fullName} 
                    size="xl" 
                    tint="dark" 
                    src={follower.avatar || follower.profileImage || follower.avatarUrl} 
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900" title={fullName}>
                      {fullName}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <UserCheck className="h-3 w-3" />
                      Following since {timeAgo(follower.followingSince || follower.followedAt)}
                    </p>
                    {follower.email && (
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">
                        {follower.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Heart className="h-3.5 w-3.5 text-rose-500" />
                    ₹{totalDonated.toLocaleString()} donated
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Coins className="h-3.5 w-3.5" />
                    {donationCount} donation{donationCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}