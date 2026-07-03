const API_URL = 'http://localhost:5000/api';

export const processDonation = async (donationData) => {
  try {
    console.log('📤 Sending donation to:', `${API_URL}/mock-donations`);
    console.log('📦 Donation data:', donationData);
    
    const response = await fetch(`${API_URL}/mock-donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(donationData)
    });

    console.log('📥 Response status:', response.status);

    // Get the response as text first
    const responseText = await response.text();
    console.log('📥 Response text:', responseText);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      // If response is HTML or error page, show the error
      if (responseText.includes('<!DOCTYPE html>')) {
        throw new Error('Server returned HTML error page. Please check if server is running.');
      }
      throw new Error(`Server error: ${responseText || 'Unknown error'}`);
    }

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('❌ Donation error:', error);
    throw error;
  }
};

// Get all donations
export const getAllDonations = async () => {
  try {
    const response = await fetch(`${API_URL}/mock-donations`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch donations: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all donations:', error);
    throw error;
  }
};

// Get campaign donations
export const getCampaignDonations = async (campaignId) => {
  try {
    const response = await fetch(`${API_URL}/mock-donations/campaign/${campaignId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch campaign donations: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching campaign donations:', error);
    throw error;
  }
};

// Get campaign stats
export const getCampaignStats = async (campaignId) => {
  try {
    const response = await fetch(`${API_URL}/mock-donations/stats/${campaignId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch stats: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

// Get donation by transaction ID
export const getDonationByTransactionId = async (transactionId) => {
  try {
    const response = await fetch(`${API_URL}/mock-donations/transaction/${transactionId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch donation: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching donation by transaction:', error);
    throw error;
  }
};