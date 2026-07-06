// followerService.js
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
        // Use creatorToken for creator panel
        const token = localStorage.getItem('creatorToken') || localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('Request:', config.method.toUpperCase(), config.url);
        console.log('Token:', token ? 'Present' : 'Missing');
        return config;
    },
    (error) => Promise.reject(error)
);

// Get all followers for the current creator
// followerService.js
export const getMyFollowers = async () => {
    try {
        const response = await api.get('/creator/followers');
        console.log('Service Response:', response.data);
        return response.data; 
    } catch (error) {
        console.error('Service Error:', error);
        throw error;
    }
};

// Follow a creator
export const followCreator = async (creatorId) => {
    try {
        const response = await api.post(`/creator/followers/${creatorId}`);
        return response.data;
    } catch (error) {
        console.error('Error following:', error);
        throw error.response?.data || { message: 'Failed to follow' };
    }
};

// Unfollow a creator
export const unfollowCreator = async (creatorId) => {
    try {
        const response = await api.delete(`/creator/followers/${creatorId}`);
        return response.data;
    } catch (error) {
        console.error('Error unfollowing:', error);
        throw error.response?.data || { message: 'Failed to unfollow' };
    }
};