// donorProfileService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const getProfile = async () => {
    try {
        const response = await api.get('/donor/profile');
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
};

export const updateProfile = async (profileData) => {
    try {
        const response = await api.put('/donor/profile', profileData);
        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

export const changePassword = async (passwordData) => {
    try {
        const response = await api.post('/donor/change-password', passwordData);
        return response.data;
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
};

// ==================== BADGE SERVICES ====================
export const getBadgeData = async () => {
  try {
    const response = await api.get('/donor/badges');
    return response.data;
  } catch (error) {
    console.error('Error fetching badge data:', error);
    throw error;
  }
};

export const seedBadges = async () => {
  try {
    const response = await api.post('/donor/badges/seed');
    return response.data;
  } catch (error) {
    console.error('Error seeding badges:', error);
    throw error;
  }
};

// ==================== DONATION SERVICES ====================
export const getDonationStats = async () => {
  try {
    const response = await api.get('/donor/donations/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    throw error;
  }
};

export const getDonationHistory = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/donor/donations/history?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching donation history:', error);
    throw error;
  }
};

// ==================== RECURRING SERVICES ====================
export const getRecurringDetails = async () => {
  try {
    const response = await api.get('/donor/recurring');
    return response.data;
  } catch (error) {
    console.error('Error fetching recurring details:', error);
    throw error;
  }
};