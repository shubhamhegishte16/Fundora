// campaignService.js
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
        const token = localStorage.getItem('creatorToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const getMyCampaigns = async () => {
    try {
        const response = await api.get('/creator/campaigns');
        return response.data;
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        throw error;
    }
};

export const getCampaignById = async (id) => {
    try {
        const response = await api.get(`/creator/campaigns/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching campaign:', error);
        throw error;
    }
};

export const createCampaign = async (campaignData) => {
    try {
        const response = await api.post('/creator/campaigns', campaignData);
        return response.data;
    } catch (error) {
        console.error('Error creating campaign:', error);
        throw error;
    }
};

export const updateCampaign = async (id, campaignData) => {
    try {
        const response = await api.put(`/creator/campaigns/${id}`, campaignData);
        return response.data;
    } catch (error) {
        console.error('Error updating campaign:', error);
        throw error;
    }
};

export const deleteCampaign = async (id) => {
    try {
        const response = await api.delete(`/creator/campaigns/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting campaign:', error);
        throw error;
    }
};
