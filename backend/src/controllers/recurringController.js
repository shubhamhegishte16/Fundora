import RecurringDonation from '../models/RecurringDonation.js';
import Donor from '../models/Donor.js';
import Donation from '../models/Donation.js';
import User from '../models/User.js';

export const getRecurringDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    // console.log('=== GET RECURRING DETAILS ===');

    // Find donor
    let donor = await Donor.findOne({ user: userId });
    if (!donor) {
      const user = await User.findById(userId);
      if (user && user.email) {
        donor = await Donor.findOne({ email: user.email });
      }
    }

    if (!donor) {
      console.log('Donor not found');
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

    // console.log('Donor ID:', donor._id);

    // FIRST: Check if recurring exists in DB
    let recurring = await RecurringDonation.findOne({
      donor: donor._id,
      status: 'active'
    });

    // SECOND: If no recurring exists, CREATE ONE from donation history
    if (!recurring) {
      console.log('No recurring found, checking donation history...');
      
      // Get all completed donations
      const donations = await Donation.find({ 
        donor: donor._id, 
        status: 'completed' 
      }).sort({ createdAt: -1 });

      // console.log(`Found ${donations.length} donations`);

      if (donations.length > 0) {
        // Check if donations are recurring (same amount repeated)
        const amounts = donations.map(d => d.amount);
        const mostCommonAmount = getMostCommonValue(amounts);
        const amountCount = amounts.filter(a => a === mostCommonAmount).length;
        
        // If more than 3 donations with same amount, consider it recurring
        if (amountCount >= 3) {
          // console.log(`Detected recurring pattern: ${amountCount} donations of $${mostCommonAmount}`);
          
          // Calculate total donated from these donations
          const totalDonated = donations
            .filter(d => d.amount === mostCommonAmount)
            .reduce((sum, d) => sum + d.amount, 0);
          
          // Get frequency from donation dates
          const frequency = detectFrequency(donations);
          
          // Create recurring record
          recurring = await RecurringDonation.create({
            donor: donor._id,
            amount: mostCommonAmount,
            frequency: frequency,
            paymentMethod: donations[0]?.paymentMethod || 'Credit Card',
            status: 'active',
            totalDonated: totalDonated,
            startDate: donations[donations.length - 1]?.createdAt || new Date(),
            nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          });
          
          // console.log('Auto-created recurring from donation history:', recurring._id);
        }
      }
    }

    // If still no recurring, return empty
    if (!recurring) {
      console.log('No recurring detected');
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

    // Return recurring data
    res.status(200).json({
      success: true,
      data: {
        hasRecurring: true,
        amount: recurring.amount || 0,
        frequency: recurring.frequency || 'Monthly',
        created: recurring.createdAt ? new Date(recurring.createdAt).toLocaleDateString() : 'N/A',
        givingFund: recurring.totalDonated || 0,
        total: recurring.totalDonated || 0,
        method: recurring.paymentMethod || 'Not set'
      }
    });

  } catch (error) {
    console.error('Error in getRecurringDetails:', error);
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

// Helper: Get most common value in array
function getMostCommonValue(arr) {
  if (arr.length === 0) return 0;
  const frequency = {};
  let maxCount = 0;
  let mostCommon = arr[0];
  
  for (const val of arr) {
    frequency[val] = (frequency[val] || 0) + 1;
    if (frequency[val] > maxCount) {
      maxCount = frequency[val];
      mostCommon = val;
    }
  }
  return mostCommon;
}

// Helper: Detect frequency from donation dates
function detectFrequency(donations) {
  if (donations.length < 2) return 'Monthly';
  
  const sorted = donations.sort((a, b) => a.createdAt - b.createdAt);
  const diffs = [];
  
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.abs(sorted[i].createdAt - sorted[i-1].createdAt);
    const days = diff / (1000 * 60 * 60 * 24);
    diffs.push(days);
  }
  
  const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  
  if (avgDiff <= 8) return 'Weekly';
  if (avgDiff <= 35) return 'Monthly';
  if (avgDiff <= 100) return 'Quarterly';
  return 'Yearly';
}