import RecurringDonation from '../models/RecurringDonation.js';
import Donor from '../models/Donor.js';

export const getRecurringDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find donor
    const donor = await Donor.findOne({ user: userId });
    if (!donor) {
      return res.status(200).json({
        success: true,
        data: {
          hasRecurring: false,
          amount: 0,
          frequency: 'Monthly',
          created: 'N/A',
          givingFund: 0,
          total: 0,
          method: 'Not set'
        }
      });
    }

    // Find active recurring
    const recurring = await RecurringDonation.findOne({
      donor: donor._id,
      status: 'active'
    });

    if (!recurring) {
      return res.status(200).json({
        success: true,
        data: {
          hasRecurring: false,
          amount: 0,
          frequency: 'Monthly',
          created: 'N/A',
          givingFund: 0,
          total: 0,
          method: 'Not set'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        hasRecurring: true,
        amount: recurring.amount,
        frequency: recurring.frequency || 'Monthly',
        created: recurring.createdAt ? new Date(recurring.createdAt).toLocaleDateString() : 'N/A',
        givingFund: recurring.totalDonated || 0,
        total: recurring.totalDonated || 0,
        method: recurring.paymentMethod || 'Credit Card'
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(200).json({
      success: true,
      data: {
        hasRecurring: false,
        amount: 0,
        frequency: 'Monthly',
        created: 'N/A',
        givingFund: 0,
        total: 0,
        method: 'Not set'
      }
    });
  }
};

// Simple seed function
export const seedRecurringDonation = async (req, res) => {
  try {
    const userId = req.user.id;
    const donor = await Donor.findOne({ user: userId });
    
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    // Delete existing
    await RecurringDonation.deleteMany({ donor: donor._id });

    // Create new
    const recurring = await RecurringDonation.create({
      donor: donor._id,
      amount: 100,
      frequency: 'Monthly',
      paymentMethod: 'Credit Card',
      status: 'active',
      totalDonated: 1200,
      startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      nextPaymentDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    });

    res.status(201).json({
      success: true,
      message: 'Recurring donation created',
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};