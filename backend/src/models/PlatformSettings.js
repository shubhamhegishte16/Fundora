import mongoose from 'mongoose';

/**
 * PlatformSettings
 * Singleton document (there is always exactly one row, enforced by the
 * fixed `_id: 'platform'`). Read/write through getSettings()/updateSettings()
 * in the controller rather than the model directly, so callers never have
 * to think about the singleton pattern.
 */
const platformSettingsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'platform' },

    general: {
      platformName: { type: String, default: 'Fundora' },
      supportEmail: { type: String, default: 'support@fundora.in' },
      currency: { type: String, default: 'INR' },
      timezone: { type: String, default: 'Asia/Kolkata' },
    },

    payments: {
      platformFeePercent: { type: Number, default: 2.5, min: 0, max: 100 },
      minDonationAmount: { type: Number, default: 50, min: 0 },
      payoutScheduleDays: { type: Number, default: 7, min: 1 },
      gatewayProvider: { type: String, default: 'Razorpay' },
    },

    campaigns: {
      requireAdminApproval: { type: Boolean, default: true },
      maxDurationDays: { type: Number, default: 90, min: 1 },
      allowedCategories: {
        type: [String],
        default: ['Education', 'Health', 'Environment', 'Disaster Relief', 'Animal Welfare', 'Community'],
      },
    },

    notifications: {
      emailOnNewCampaign: { type: Boolean, default: true },
      emailOnKycSubmission: { type: Boolean, default: true },
      emailOnFraudAlert: { type: Boolean, default: true },
      emailOnLargeDonation: { type: Boolean, default: true },
      largeDonationThreshold: { type: Number, default: 50000, min: 0 },
    },

    security: {
      require2FAForAdmins: { type: Boolean, default: false },
      sessionTimeoutMinutes: { type: Number, default: 1440, min: 5 },
      maxLoginAttempts: { type: Number, default: 10, min: 1 },
    },

    maintenanceMode: { type: Boolean, default: false },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('PlatformSettings', platformSettingsSchema);