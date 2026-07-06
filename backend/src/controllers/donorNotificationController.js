import DonorNotification from '../models/DonorNotification.js';

export const getNotifications = async (req, res) => {
  try {
    const donorId = req.user._id;
    const notifications = await DonorNotification.find({ donor: donorId })
      .sort({ createdAt: -1 })
      .limit(50); // Keep it reasonable

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const donorId = req.user._id;
    const { id } = req.params;

    if (id === 'all') {
      await DonorNotification.updateMany(
        { donor: donorId, isRead: false },
        { $set: { isRead: true } }
      );
    } else {
      await DonorNotification.findOneAndUpdate(
        { _id: id, donor: donorId },
        { $set: { isRead: true } }
      );
    }

    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
