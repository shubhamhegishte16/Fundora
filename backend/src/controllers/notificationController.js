import Notification from '../models/Notification.js';

// ─── GET /api/creator/notifications ─────────────────────────────────────────
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ creator: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      notifications: notifications.map((n) => ({
        id: n._id,
        type: n.type,
        title: n.title,
        detail: n.detail,
        time: n.createdAt,
        read: n.isRead,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PATCH /api/creator/notifications/:id/read ──────────────────────────────
export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, creator: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PATCH /api/creator/notifications/read-all ──────────────────────────────
export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ creator: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
