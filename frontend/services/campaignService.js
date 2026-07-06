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

// If campaignData.coverImageFile is a File, this sends multipart/form-data
// so the backend's multer middleware can store it; otherwise it sends plain
// JSON exactly as before.
function buildPayload(campaignData) {
    const { coverImageFile, ...rest } = campaignData;
    if (!(coverImageFile instanceof File)) {
        return { data: rest, isFormData: false };
    }
    const formData = new FormData();
    Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value);
    });
    formData.append('coverImage', coverImageFile);
    return { data: formData, isFormData: true };
}

export const createCampaign = async (campaignData) => {
    try {
        const { data, isFormData } = buildPayload(campaignData);
        const response = await api.post('/creator/campaigns', data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
        return response.data;
    } catch (error) {
        console.error('Error creating campaign:', error);
        throw error;
    }
};

export const updateCampaign = async (id, campaignData) => {
    try {
        const { data, isFormData } = buildPayload(campaignData);
        const response = await api.put(`/creator/campaigns/${id}`, data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
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
