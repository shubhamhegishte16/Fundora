import DonorNotification from '../models/DonorNotification.js';

/**
 * Creates a new notification for a donor
 * @param {Object} params
 * @param {String} params.donorId - The ID of the donor
 * @param {String} params.type - The type of notification (donation, saved_campaign, follow, badge, profile_change, new_campaign)
 * @param {String} params.title - Short title of the notification
 * @param {String} params.detail - Longer description
 * @param {String} [params.category='Activity'] - Category for UI icon (Payment, Activity, Badge, Message, Receipt)
 * @param {String} [params.relatedCampaign=null] - Optional ID of a related campaign
 * @param {String} [params.relatedCreator=null] - Optional ID of a related creator
 */
export const createDonorNotification = async ({
  donorId,
  type,
  title,
  detail,
  category = 'Activity',
  relatedCampaign = null,
  relatedCreator = null
}) => {
  try {
    const notification = new DonorNotification({
      donor: donorId,
      type,
      title,
      detail,
      category,
      relatedCampaign,
      relatedCreator
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating donor notification:', error);
    // We swallow the error so it doesn't break the main flow (e.g. donation processing)
    return null;
  }
};
