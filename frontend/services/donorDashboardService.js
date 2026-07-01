// donorDashboardService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add authorization token
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

export const getDonorDashboard = async () => {
    try {
        const response = await api.get('/donor/dashboard');
        return response.data;
    } catch (error) {
        console.error('Error fetching donor dashboard:', error);
        throw error;
    }
};
