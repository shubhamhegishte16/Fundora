import express from 'express';
import {
  processDonation,
  getAllDonationsList,
  getCampaignDonationsList,
  getCampaignDonationStats,
  getDonationByTransaction,
} from '../controllers/donationProcessingController.js';

const router = express.Router();

// Kept at the same paths the donor frontend already calls
// (see frontend/services/MockDonationServices.js) — this now writes to the
// real Donation collection instead of the old MockDonation collection, so
// donations actually show up in the creator dashboard/donations/badges and
// correctly move the campaign's funded %.
router.get('/mock-donations/test', (req, res) => {
  res.json({ success: true, message: 'Donation route is working!' });
});

router.get('/mock-donations', getAllDonationsList);
router.post('/mock-donations', processDonation);
router.get('/mock-donations/campaign/:campaignId', getCampaignDonationsList);
router.get('/mock-donations/stats/:campaignId', getCampaignDonationStats);
router.get('/mock-donations/transaction/:transactionId', getDonationByTransaction);

export default router;
