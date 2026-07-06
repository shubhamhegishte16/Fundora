import axios from 'axios';

// Get token (same approach used in other services)
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('donorToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = `${API_BASE}/donor/creators`;

export const discoverCreators = async (search = '', category = 'All Categories') => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category && category !== 'All Categories') params.append('category', category);
  
  const response = await axios.get(`${API_URL}?${params.toString()}`, getAuthHeaders());
  return response.data;
};

export const getFollowingCreators = async (category = 'All Categories') => {
  const params = new URLSearchParams();
  if (category && category !== 'All Categories') params.append('category', category);
  
  const response = await axios.get(`${API_URL}/following?${params.toString()}`, getAuthHeaders());
  return response.data;
};

export const toggleFollowCreator = async (creatorId) => {
  const response = await axios.post(`${API_URL}/${creatorId}/follow`, {}, getAuthHeaders());
  return response.data;
};
