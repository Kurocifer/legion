import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { taskAPI } from '../../api/task';
import { userAPI } from '../../api/user';
import { sprintAPI } from '../../api/sprint';
import useWorkspaceStore from '../../store/workspaceStore';

const TaskDetailModal = ({ isOpen, onClose, task, onTaskUpdated, onTaskDeleted }) => {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [sprints, setSprints] = useState([]);
  const [members, setMembers] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    assigneeId: null,
    sprintId: null,
  });

  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assigneeId: task.assignee?.id || null,
        sprintId: task.sprint?.id || null,
      });
      loadSprints();
      loadMembers();
    }
  }, [isOpen, task]);

  const loadSprints = async () => {
    try {
      const data = await sprintAPI.getSprintsByProject(task.project.id);
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

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let updatedTask = { ...task };

      // Update basic fields (title, description, priority)
      if (
        formData.title !== task.title ||
        formData.description !== task.description ||
        formData.priority !== task.priority
      ) {
        updatedTask = await taskAPI.updateTask(task.id, {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
        });
      }

      // Update status if changed
      if (formData.status !== task.status) {
        updatedTask = await taskAPI.updateTaskStatus(task.id, formData.status);
      }
      
      // Update assignee if changed
      if (formData.assigneeId !== task.assignee?.id) {
        updatedTask = await taskAPI.assignTaskToUser(task.id, formData.assigneeId);
      }

      // Update sprint if changed
      if (formData.sprintId !== task.sprint?.id) {
        if (formData.sprintId) {
          updatedTask = await taskAPI.assignTaskToSprint(task.id, formData.sprintId);
        }
      }
      
      alert('Task updated successfully!');
      onTaskUpdated(updatedTask);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
      alert(error.response?.data?.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      await taskAPI.deleteTask(task.id);
      alert('Task deleted successfully!');
      onTaskDeleted(task.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert(error.response?.data?.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {task.project?.key}-{task.taskNumber}
              </span>
              {editing ? (
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="text-xs px-2 py-1 rounded border border-gray-300 focus:ring-2 focus:ring-legion-gold"
                >
                  <option value="LOW">🟢 Low</option>
                  <option value="MEDIUM">🟡 Medium</option>
                  <option value="HIGH">🟠 High</option>
                  <option value="CRITICAL">🔴 Critical</option>
                </select>
              ) : (
                <span className={`text-xs px-2 py-1 rounded ${
                  task.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                  task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                  task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.priority}
                </span>
              )}
            </div>
            {editing ? (
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-2xl font-bold text-legion-navy border-b-2 border-legion-gold focus:outline-none w-full"
              />
            ) : (
              <h2 className="text-2xl font-bold text-legion-navy">{task.title}</h2>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            {editing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {task.description || 'No description provided'}
              </p>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              {editing ? (
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
              ) : (
                <p className="text-gray-900 font-medium">{task.status.replace('_', ' ')}</p>
              )}
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignee
              </label>
              {editing ? (
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
              ) : (
                <p className="text-gray-900 font-medium">
                  {task.assignee?.fullName || 'Unassigned'}
                </p>
              )}
            </div>

            {/* Sprint */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sprint
              </label>
              {editing ? (
                <select
                  value={formData.sprintId || ''}
                  onChange={(e) => setFormData({ ...formData, sprintId: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
                >
                  <option value="">No Sprint</option>
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900 font-medium">
                  {task.sprint?.name || 'No Sprint'}
                </p>
              )}
            </div>

            {/* Reporter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reporter
              </label>
              <p className="text-gray-900 font-medium">
                {task.reporter?.fullName || 'Unknown'}
              </p>
            </div>

            {/* Created */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created
              </label>
              <p className="text-gray-900 font-medium">
                {new Date(task.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={16} />
            Delete
          </button>

          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      title: task.title,
                      description: task.description || '',
                      status: task.status,
                      priority: task.priority,
                      assigneeId: task.assignee?.id || null,
                      sprintId: task.sprint?.id || null,
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-legion-gold text-legion-navy rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-legion-tech-blue text-white rounded-lg font-semibold hover:opacity-90"
              >
                Edit Task
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;