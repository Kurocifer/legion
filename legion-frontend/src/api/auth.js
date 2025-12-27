import apiClient from './axios';

export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', {
      email: userData.email,
      password: userData.password,
      fullName: userData.name,
    });
    return response.data;
  },

  // Login
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // Accept invitation
  acceptInvitation: async (token, userData) => {
    const response = await apiClient.post('/auth/accept-invitation', {
      token,
      email: userData.email,
      password: userData.password,
      fullName: userData.name,
    });
    return response.data;
  },
};