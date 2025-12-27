import { useState, useEffect } from 'react';
import { List, Filter, Search, User, Calendar } from 'lucide-react';
import { taskAPI } from '../api/task';
import { projectAPI } from '../api/project';
import useWorkspaceStore from '../store/workspaceStore';
import TaskDetailModal from '../components/task/TaskDetailModal';

const Tasks = () => {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');

  useEffect(() => {
    if (currentWorkspace) {
      loadTasks();
      loadProjects();
    }
  }, [currentWorkspace]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await taskAPI.getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      alert('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await projectAPI.getProjectsByWorkspace(currentWorkspace.workspace.id);
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setDetailModalOpen(true);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    setSelectedTask(updatedTask);
  };

  const handleTaskDeleted = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));
    setDetailModalOpen(false);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Search filter
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'ALL' && task.status !== statusFilter) {
      return false;
    }

    // Priority filter
    if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) {
      return false;
    }

    // Project filter
    if (projectFilter !== 'ALL' && task.project?.id !== parseInt(projectFilter)) {
      return false;
    }

    return true;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600 bg-red-50';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'BACKLOG': return 'text-gray-600 bg-gray-100';
      case 'TODO': return 'text-blue-600 bg-blue-100';
      case 'IN_PROGRESS': return 'text-yellow-600 bg-yellow-100';
      case 'REVIEW': return 'text-purple-600 bg-purple-100';
      case 'DONE': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-legion-navy flex items-center gap-3">
            <List size={32} />
            All Tasks
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
          >
            <option value="ALL">All Statuses</option>
            <option value="BACKLOG">Backlog</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">🔴 Critical</option>
            <option value="HIGH">🟠 High</option>
            <option value="MEDIUM">🟡 Medium</option>
            <option value="LOW">🟢 Low</option>
          </select>

          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
          >
            <option value="ALL">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} [{project.key}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task Table */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <List size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Assignee</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sprint</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Project</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-600">
                      {task.project?.key}-{task.taskNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-legion-navy">{task.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-700">{task.assignee.fullName}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {task.sprint ? (
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-700">{task.sprint.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No sprint</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{task.project?.name}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        task={selectedTask}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />
    </div>
  );
};

export default Tasks;