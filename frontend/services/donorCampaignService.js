// donorCampaignService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add authorization token if needed
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

export const getAllActiveCampaigns = async () => {
    try {
        const response = await api.get('/donor/campaigns/explore');
        return response.data;
    } catch (error) {
        console.error('Error fetching explore campaigns:', error);
        throw error;
    }
};

export const getSavedCampaigns = async () => {
    try {
        const response = await api.get('/donor/campaigns/saved');
        return response.data;
    } catch (error) {
        console.error('Error fetching saved campaigns:', error);
        throw error;
    }
};

export const toggleSaveCampaign = async (id) => {
    try {
        const response = await api.post(`/donor/campaigns/${id}/save`);
        return response.data;
    } catch (error) {
        console.error('Error saving campaign:', error);
        throw error;
    }
};
