// notificationService.js
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

export const getMyNotifications = async () => {
    try {
        const response = await api.get('/creator/notifications');
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

export const markNotificationRead = async (id) => {
    try {
        const response = await api.patch(`/creator/notifications/${id}/read`);
        return response.data;
    } catch (error) {
        console.error('Error marking notification read:', error);
        throw error;
    }
};

export const markAllNotificationsRead = async () => {
    try {
        const response = await api.patch('/creator/notifications/read-all');
        return response.data;
    } catch (error) {
        console.error('Error marking all notifications read:', error);
        throw error;
    }
};
