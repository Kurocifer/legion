import apiClient from './axios';

export const workspaceAPI = {
  // Create workspace
  createWorkspace: async (data) => {
    const response = await apiClient.post('/workspaces', data);
    return response.data;
  },

  // Get workspace by ID
  getWorkspaceById: async (id) => {
    const response = await apiClient.get(`/workspaces/${id}`);
    return response.data;
  },

  // Get workspace by slug
  getWorkspaceBySlug: async (slug) => {
    const response = await apiClient.get(`/workspaces/slug/${slug}`);
    return response.data;
  },

  // Get user's workspaces
  getMyWorkspaces: async () => {
    const response = await apiClient.get('/workspaces/my-workspaces');
    return response.data;
  },

  // Get workspace members
  getWorkspaceMembers: async (workspaceId) => {
    const response = await apiClient.get(`/workspaces/${workspaceId}/members`);
    return response.data;
  },
};