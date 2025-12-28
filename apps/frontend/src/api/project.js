import apiClient from './axios';

export const projectAPI = {
  // Create project (ADMIN only)
  createProject: async (data) => {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },

  // Get project by ID
  getProjectById: async (id) => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  // Get projects by workspace
  getProjectsByWorkspace: async (workspaceId) => {
    const response = await apiClient.get(`/projects/workspace/${workspaceId}`);
    return response.data;
  },
};