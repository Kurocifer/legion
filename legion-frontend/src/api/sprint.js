import apiClient from './axios';

export const sprintAPI = {
  // Create sprint (ADMIN/MANAGER)
  createSprint: async (data) => {
    const response = await apiClient.post('/sprints', data);
    return response.data;
  },

  // Get sprint by ID
  getSprintById: async (id) => {
    const response = await apiClient.get(`/sprints/${id}`);
    return response.data;
  },

  // Get sprints by project
  getSprintsByProject: async (projectId) => {
    const response = await apiClient.get(`/sprints/project/${projectId}`);
    return response.data;
  },

  // Update sprint status
  updateSprintStatus: async (id, status) => {
    const response = await apiClient.patch(`/sprints/${id}/status`, { status });
    return response.data;
  },
};