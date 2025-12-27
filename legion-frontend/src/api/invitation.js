import apiClient from './axios';

export const invitationAPI = {
  // Create invitation (ADMIN/MANAGER)
  createInvitation: async (data) => {
    const response = await apiClient.post('/invitations', data);
    return response.data;
  },

  // Get invitation by token (public)
  getInvitationByToken: async (token) => {
    const response = await apiClient.get(`/invitations/token/${token}`);
    return response.data;
  },

  // Get workspace invitations
  getWorkspaceInvitations: async (workspaceId) => {
    const response = await apiClient.get(`/invitations/workspace/${workspaceId}`);
    return response.data;
  },
};