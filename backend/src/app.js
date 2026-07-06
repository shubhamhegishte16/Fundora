import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import creatorAuthRoutes from './routes/creatorAuthRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import donorProfileRoute from "./routes/donorProfileRoute.js";
import badgeRoutes from './routes/badgeRoutes.js';
import campaignRoutes from "./routes/campaignRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import followerRoutes from "./routes/followerRoutes.js";
import donorCampaignRoutes from "./routes/donorCampaignRoutes.js";
import donorDashboardRoutes from "./routes/donorDashboardRoutes.js";
import donorCreatorRoutes from "./routes/donorCreatorRoutes.js";
import donorNotificationRoutes from "./routes/donorNotificationRoutes.js";
import myDonationsRoutes from "./routes/myDonationsRoutes.js";
import MockDonationRoutes from "./routes/MockDonationRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import adminCampaignRoutes from "./routes/adminCampaignRoutes.js";
import adminDonationRoutes from "./routes/adminDonationRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import adminKycRoutes from "./routes/adminKycRoutes.js";
import adminFraudRoutes from "./routes/adminFraudRoutes.js";
import adminNotificationRoutes from "./routes/adminNotificationRoutes.js";
// add to imports, right after adminNotificationRoutes:
import adminAnalyticsRoutes from "./routes/adminAnalyticsRoutes.js";

// add to mounts, right after adminNotificationRoutes mount:

// ...

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded KYC files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/creator/auth', creatorAuthRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use("/api/creator/campaigns", campaignRoutes);
app.use("/api/creator/dashboard", dashboardRoutes);
app.use("/api/creator/donations", donationRoutes);
app.use("/api/creator/notifications", notificationRoutes);
app.use("/api/creator/badges", badgeRoutes);
app.use("/api/creator/community", communityRoutes);
app.use("/api/creator/followers", followerRoutes);
app.use("/api/donor", donorProfileRoute);
app.use('/api/donor/badges', badgeRoutes);
app.use("/api/donor/campaigns", donorCampaignRoutes);
app.use("/api/donor/creators", donorCreatorRoutes);
app.use("/api/donor/notifications", donorNotificationRoutes);
app.use("/api/donor/dashboard", donorDashboardRoutes);
app.use("/api/donor/mydonations", myDonationsRoutes);
app.use("/api", MockDonationRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/campaigns", adminCampaignRoutes);
app.use("/api/admin/donations", adminDonationRoutes);
app.use("/api/admin/kyc", adminKycRoutes);
app.use("/api/admin/fraud", adminFraudRoutes);
app.use("/api/admin/notifications", adminNotificationRoutes);
app.use("/api/admin", adminUserRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
  });
});

export default app;