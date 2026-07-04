// src/models/RecurringDonation.js
import mongoose from 'mongoose';

const recurringDonationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    frequency: {
      type: String,
      enum: ['Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly', 'Yearly'],
      default: 'Monthly',
    },
    paymentMethod: {
      type: String,
      enum: ['Credit Card', 'Debit Card', 'Bank Transfer', 'UPI', 'PayPal'],
      default: 'Credit Card',
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled', 'completed'],
      default: 'active',
    },
    nextPaymentDate: {
      type: Date,
    },
    totalDonated: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

recurringDonationSchema.index({ donor: 1, status: 1 });
recurringDonationSchema.index({ nextPaymentDate: 1 });

const RecurringDonation = mongoose.model('RecurringDonation', recurringDonationSchema);
export default RecurringDonation;