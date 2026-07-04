import AdminNotification from '../models/AdminNotification.js';

// Maps AdminNotification.type -> the frontend's grouping/label scheme
const TYPE_UI = {
  campaign_pending: 'campaign',
  kyc_pending: 'kyc',
  fraud_alert: 'fraud',
  new_user: 'user',
  large_donation: 'donation',
  system: 'system',
};

const timeAgo = (date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const formatNotification = (n) => ({
  id: n._id,
  type: TYPE_UI[n.type] || 'system',
  title: n.title,
  desc: n.message,
  time: timeAgo(n.createdAt),
  unread: !n.isRead,
  priority: n.priority,
  createdAt: n.createdAt,
});

// ─── GET /api/admin/notifications ──────────────────────────────────────────
// Query params: filter (All/Unread/Campaign/Kyc/Fraud/User/Donation/System)
export const getNotifications = async (req, res) => {
  try {
    const { filter = 'All' } = req.query;

    const query = {};
    if (filter === 'Unread') {
      query.isRead = false;
    } else if (filter !== 'All') {
      const type = Object.keys(TYPE_UI).find((k) => TYPE_UI[k] === filter.toLowerCase());
      if (type) query.type = type;
    }

    const notifications = await AdminNotification.find(query).sort({ createdAt: -1 }).limit(200);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [total, unread, today] = await Promise.all([
      AdminNotification.countDocuments({}),
      AdminNotification.countDocuments({ isRead: false }),
      AdminNotification.countDocuments({ createdAt: { $gte: startOfToday } }),
    ]);

    res.json({
      success: true,
      notifications: notifications.map(formatNotification),
      stats: { total, unread, today },
    });
  } catch (error) {
    console.error('getNotifications error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch notifications' });
  }
};

// ─── PATCH /api/admin/notifications/:id/read ───────────────────────────────
export const markNotificationRead = async (req, res) => {
  try {
    const notification = await AdminNotification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, notification: formatNotification(notification) });
  } catch (error) {
    console.error('markNotificationRead error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update notification' });
  }
};

// ─── PATCH /api/admin/notifications/read-all ───────────────────────────────
export const markAllNotificationsRead = async (req, res) => {
  try {
    await AdminNotification.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    console.error('markAllNotificationsRead error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update notifications' });
  }
};

// ─── DELETE /api/admin/notifications/:id ───────────────────────────────────
export const deleteNotification = async (req, res) => {
  try {
    const notification = await AdminNotification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('deleteNotification error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete notification' });
  }
};