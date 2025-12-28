import apiClient from './axios';

export const taskAPI = {
  // Create task
  createTask: async (data) => {
    const response = await apiClient.post('/tasks', data);
    return response.data;
  },

  // Get task by ID
  getTaskById: async (id) => {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  },

  // Get all tasks in workspace
  getAllTasks: async () => {
    const response = await apiClient.get('/tasks');
    return response.data;
  },

  // Get tasks by project
  getTasksByProject: async (projectId) => {
    const response = await apiClient.get(`/tasks/project/${projectId}`);
    return response.data;
  },

  // Get tasks by sprint
  getTasksBySprint: async (sprintId) => {
    const response = await apiClient.get(`/tasks/sprint/${sprintId}`);
    return response.data;
  },

  // Get tasks by assignee
  getTasksByAssignee: async (assigneeId) => {
    const response = await apiClient.get(`/tasks/assignee/${assigneeId}`);
    return response.data;
  },

  // Update task status - FIXED: Send object with status property
  updateTaskStatus: async (id, status) => {
    const response = await apiClient.patch(`/tasks/${id}/status`, { 
      status: status // Backend expects { status: "TODO" }
    });
    return response.data;
  },

  // Assign task to sprint - FIXED: Send object with sprintId property
  assignTaskToSprint: async (id, sprintId) => {
    const response = await apiClient.patch(`/tasks/${id}/sprint`, { 
      sprintId: sprintId // Backend expects { sprintId: 123 }
    });
    return response.data;
  },

  // Update task (title, description, priority)
  updateTask: async (id, data) => {
    const response = await apiClient.put(`/tasks/${id}`, {
      title: data.title,
      description: data.description,
      priority: data.priority,
    });
    return response.data;
  },

  // Assign task to user
  assignTaskToUser: async (id, assigneeId) => {
    const response = await apiClient.patch(`/tasks/${id}/assignee`, { 
      assigneeId: assigneeId
    });
    return response.data;
  },

  // Delete task
  deleteTask: async (id) => {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  },
};