import { create } from 'zustand';

const useWorkspaceStore = create((set) => ({
  // State
  currentWorkspace: JSON.parse(localStorage.getItem('currentWorkspace')) || null,
  currentWorkspaceId: localStorage.getItem('currentWorkspaceId') || null,
  workspaces: [],

  // Actions
  setCurrentWorkspace: (workspace) => {
    localStorage.setItem('currentWorkspace', JSON.stringify(workspace));
    localStorage.setItem('currentWorkspaceId', workspace.workspace.id.toString());
    set({ 
      currentWorkspace: workspace,
      currentWorkspaceId: workspace.workspace.id.toString()
    });
  },

  setWorkspaces: (workspaces) => {
    set({ workspaces });
  },

  clearWorkspace: () => {
    localStorage.removeItem('currentWorkspace');
    localStorage.removeItem('currentWorkspaceId');
    set({ currentWorkspace: null, currentWorkspaceId: null, workspaces: [] });
  },
}));

export default useWorkspaceStore;