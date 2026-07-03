import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema({
  campaignId: { 
    type: String, 
    required: true 
  },
  donorName: { 
    type: String, 
    default: 'Anonymous' 
  },
  donorEmail: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  tip: { 
    type: Number, 
    default: 0 
  },
  total: { 
    type: Number, 
    required: true 
  },
  paymentMethod: { 
    type: String, 
    required: true 
  },
  isAnonymous: { 
    type: Boolean, 
    default: false 
  },
  receiveUpdates: { 
    type: Boolean, 
    default: true 
  },
  transactionId: { 
    type: String, 
    unique: true,
    sparse: true 
  },
  receiptId: { 
    type: String, 
    unique: true,
    sparse: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Pre-save middleware to generate IDs
DonationSchema.pre('save', function(next) {
  // Generate receiptId if not exists
  if (!this.receiptId) {
    this.receiptId = `RCP-${Date.now().toString().slice(-8)}`;
  }
  
  // Generate transactionId if not exists
  if (!this.transactionId) {
    this.transactionId = `TXN-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }
  
  // Always call next() to continue the save operation
//   next();
});

// Optional: Add a post-save hook for logging
DonationSchema.post('save', function(doc) {
  console.log('✅ Donation saved with ID:', doc._id);
  console.log('📄 Receipt ID:', doc.receiptId);
  console.log('🔑 Transaction ID:', doc.transactionId);
});

// Add a static method to get campaign stats
DonationSchema.statics.getCampaignStats = async function(campaignId) {
  const stats = await this.aggregate([
    { $match: { campaignId: campaignId, status: 'completed' } },
    { $group: {
      _id: null,
      totalRaised: { $sum: '$amount' },
      totalDonations: { $sum: 1 },
      averageAmount: { $avg: '$amount' }
    }}
  ]);
  
  return stats[0] || { totalRaised: 0, totalDonations: 0, averageAmount: 0 };
};

const Donation = mongoose.model('MockDonation', DonationSchema);

export default Donation;