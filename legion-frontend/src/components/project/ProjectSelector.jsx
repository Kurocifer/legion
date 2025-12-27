import { useState, useEffect } from 'react';
import { Plus, FolderKanban, X } from 'lucide-react';
import { projectAPI } from '../../api/project';
import useWorkspaceStore from '../../store/workspaceStore';

const ProjectSelector = ({ selectedProject, onProjectChange }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectAPI.getProjectsByWorkspace(
        currentWorkspace.workspace.id
      );
      console.log('Loaded projects:', data);
      setProjects(data);
      
      if (data.length > 0 && !selectedProject) {
        onProjectChange(data[0]);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      alert('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const key = name
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '')
      .substring(0, 5);
    
    setFormData({ ...formData, name, key });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    
    if (!formData.key || !/^[A-Z0-9]{2,5}$/.test(formData.key)) {
      newErrors.key = 'Key must be 2-5 uppercase letters/numbers';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setCreateLoading(true);
    try {
      const newProject = await projectAPI.createProject({
        ...formData,
        workspaceId: currentWorkspace.workspace.id,
      });
      
      alert(`Project "${newProject.name}" created!`);
      await loadProjects();
      setCreateModalOpen(false);
      setFormData({ name: '', key: '', description: '' });
      setErrors({});
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create project');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <select
          value={selectedProject?.id || ''}
          onChange={(e) => {
            const project = projects.find((p) => p.id === parseInt(e.target.value));
            onProjectChange(project);
          }}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-legion-gold focus:border-transparent"
          style={{ width: '300px', height: '40px' }}
        >
          <option value="" disabled>Select a project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} [{p.key}]
            </option>
          ))}
        </select>

        {currentWorkspace?.role === 'ADMIN' && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-legion-gold text-legion-navy rounded-lg font-semibold hover:opacity-90 flex items-center gap-2"
          >
            <Plus size={16} />
            New Project
          </button>
        )}
      </div>

      {/* Create Project Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-legion-navy">Create New Project</h2>
              <button onClick={() => setCreateModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Mobile App"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Key
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                  placeholder="MOB"
                  maxLength={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Short identifier for tasks (e.g., MOB-123)</p>
                {errors.key && <p className="text-red-500 text-sm mt-1">{errors.key}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this project about?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-legion-gold text-legion-navy rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {createLoading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectSelector;