import axios from 'axios';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('donorToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

const API_URL = 'http://localhost:5000/api/donor/notifications';

export const getDonorNotifications = async () => {
  const response = await axios.get(API_URL, getAuthHeaders());
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await axios.put(`${API_URL}/${id}/read`, {}, getAuthHeaders());
  return response.data;
};
