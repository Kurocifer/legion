import { useState, useEffect } from 'react';
import { Plus, Target, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { sprintAPI } from '../../api/sprint';
import useWorkspaceStore from '../../store/workspaceStore';

const SprintSelector = ({ projectId, selectedSprint, onSprintChange }) => {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  
  const [formData, setFormData] = useState({
    name: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from creation
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (projectId) {
      loadSprints();
    }
  }, [projectId]);

  const loadSprints = async () => {
    setLoading(true);
    try {
      const data = await sprintAPI.getSprintsByProject(projectId);
      setSprints(data);
      
      const activeSprint = data.find((s) => s.status === 'ACTIVE');
      if (activeSprint && !selectedSprint) {
        onSprintChange(activeSprint);
      } else if (data.length > 0 && !selectedSprint) {
        onSprintChange(data[0]);
      }
    } catch (error) {
      alert('Failed to load sprints');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Sprint name is required';
    }
    
    if (formData.startDate >= formData.endDate) {
      newErrors.dates = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setCreateLoading(true);
    try {
      const newSprint = await sprintAPI.createSprint({
        projectId,
        name: formData.name,
        startDate: formData.startDate.toISOString().split('T')[0],
        endDate: formData.endDate.toISOString().split('T')[0],
      });
      
      alert(`Sprint "${newSprint.name}" created!`);
      setSprints([...sprints, newSprint]);
      onSprintChange(newSprint);
      setCreateModalOpen(false);
      setFormData({
        name: '',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      });
      setErrors({});
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create sprint');
    } finally {
      setCreateLoading(false);
    }
  };

  const canCreate = ['ADMIN', 'MANAGER'].includes(currentWorkspace?.role);

  const getStatusBadge = (status) => {
    const colors = {
      PLANNED: 'text-blue-600',
      ACTIVE: 'text-green-600',
      COMPLETED: 'text-gray-600',
    };
    return <span className={`${colors[status]} text-xs`}>● {status}</span>;
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <select
          value={selectedSprint?.id || ''}
          onChange={(e) => {
            const sprint = sprints.find((s) => s.id === parseInt(e.target.value));
            onSprintChange(sprint);
          }}
          disabled={loading || !projectId}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-legion-gold focus:border-transparent disabled:bg-gray-100"
          style={{ width: '300px', height: '40px' }}
        >
          <option value="" disabled>Select a sprint</option>
          {sprints.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} - {s.status}
            </option>
          ))}
        </select>

        {canCreate && projectId && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-legion-gold text-legion-navy rounded-lg font-semibold hover:opacity-90 flex items-center gap-2"
          >
            <Plus size={16} />
            New Sprint
          </button>
        )}
      </div>

      {/* Create Sprint Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-legion-navy">Create New Sprint</h2>
              <button onClick={() => setCreateModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateSprint}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sprint Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Sprint 1: Q1 Launch"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <DatePicker
                  selected={formData.startDate}
                  onChange={(date) => setFormData({ ...formData, startDate: date })}
                  dateFormat="yyyy-MM-dd"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <DatePicker
                  selected={formData.endDate}
                  onChange={(date) => setFormData({ ...formData, endDate: date })}
                  dateFormat="yyyy-MM-dd"
                  minDate={formData.startDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
                />
                {errors.dates && <p className="text-red-500 text-sm mt-1">{errors.dates}</p>}
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
                  {createLoading ? 'Creating...' : 'Create Sprint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SprintSelector;