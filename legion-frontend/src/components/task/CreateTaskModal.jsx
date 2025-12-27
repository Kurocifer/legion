import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { taskAPI } from '../../api/task';
import { userAPI } from '../../api/user';
import { sprintAPI } from '../../api/sprint';
import useAuthStore from '../../store/authStore';
import useWorkspaceStore from '../../store/workspaceStore';

const CreateTaskModal = ({ isOpen, onClose, project, defaultStatus, onTaskCreated }) => {
  const user = useAuthStore((state) => state.user);
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  
  const [loading, setLoading] = useState(false);
  const [sprints, setSprints] = useState([]);
  const [members, setMembers] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: defaultStatus || 'BACKLOG',
    priority: 'MEDIUM',
    assigneeId: null,
    sprintId: null,
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && project) {
      loadSprints();
      loadMembers();
    }
  }, [isOpen, project]);

  const loadSprints = async () => {
    try {
      const data = await sprintAPI.getSprintsByProject(project.id);
      setSprints(data);
    } catch (error) {
      console.error('Failed to load sprints:', error);
    }
  };

  const loadMembers = async () => {
    try {
      const data = await userAPI.getWorkspaceMembers(currentWorkspace.workspace.id);
      setMembers(data);
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title || formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const newTask = await taskAPI.createTask({
        projectId: project.id,
        reporterId: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        assigneeId: formData.assigneeId || null,
        sprintId: formData.sprintId || null,
      });
      
      alert(`Task created: ${project.key}-${newTask.taskNumber}`);
      onTaskCreated(newTask);
      handleClose();
    } catch (error) {
      console.error('Failed to create task:', error);
      alert(error.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      status: defaultStatus || 'BACKLOG',
      priority: 'MEDIUM',
      assigneeId: null,
      sprintId: null,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-legion-navy">Create New Task</h2>
            <p className="text-sm text-gray-500">Project: {project?.name} [{project?.key}]</p>
          </div>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Fix login bug on Android"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the task in detail..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
            />
          </div>

          {/* Row: Status + Priority */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
              >
                <option value="LOW">🟢 Low</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="HIGH">🟠 High</option>
                <option value="CRITICAL">🔴 Critical</option>
              </select>
            </div>
          </div>

          {/* Row: Assignee + Sprint */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignee
              </label>
              <select
                value={formData.assigneeId || ''}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sprint
              </label>
              <select
                value={formData.sprintId || ''}
                onChange={(e) => setFormData({ ...formData, sprintId: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
              >
                <option value="">No Sprint</option>
                {sprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name} ({sprint.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-legion-gold text-legion-navy rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;