import AdminNotification from '../models/AdminNotification.js';

/**
 * notifyAdmins
 * Fire-and-forget side effect that writes a row into the shared admin
 * notification inbox (AdminNotification). Called from wherever an event
 * worth surfacing to admins happens (new KYC submission, fraud alert,
 * large donation, new campaign pending review, new user, etc).
 *
 * Never throws — a notification failure should never break the calling
 * request (e.g. a donation should still succeed even if the notification
 * write fails for some reason).
 */
export const notifyAdmins = async ({
  type,
  title,
  message,
  priority = 'medium',
  relatedCampaign = null,
  relatedCreator = null,
  relatedUser = null,
  relatedDonation = null,
  relatedFraudAlert = null,
}) => {
  try {
    await AdminNotification.create({
      type,
      title,
      message,
      priority,
      relatedCampaign,
      relatedCreator,
      relatedUser,
      relatedDonation,
      relatedFraudAlert,
    });
  } catch (error) {
    console.error('notifyAdmins error:', error);
  }
};
