// communityService.js
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

export const getCommunityPosts = async () => {
    try {
        const response = await api.get('/creator/community/posts');
        return response.data;
    } catch (error) {
        console.error('Error fetching community posts:', error);
        throw error;
    }
};

export const createCommunityPost = async (content) => {
    try {
        const response = await api.post('/creator/community/posts', { content });
        return response.data;
    } catch (error) {
        console.error('Error creating community post:', error);
        throw error;
    }
};

export const toggleCommunityPostLike = async (postId) => {
    try {
        const response = await api.post(`/creator/community/posts/${postId}/like`);
        return response.data;
    } catch (error) {
        console.error('Error toggling like:', error);
        throw error;
    }
};
