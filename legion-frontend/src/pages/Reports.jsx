import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import ProjectSelector from '../components/project/ProjectSelector';
import { taskAPI } from '../api/task';
import useWorkspaceStore from '../store/workspaceStore';

const Reports = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedProject) {
      loadTasks();
    }
  }, [selectedProject]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await taskAPI.getTasksByProject(selectedProject.id);
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      alert('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const getTasksByStatus = () => {
    const statusCounts = {
      BACKLOG: 0,
      TODO: 0,
      IN_PROGRESS: 0,
      REVIEW: 0,
      DONE: 0,
    };

    tasks.forEach((task) => {
      if (statusCounts.hasOwnProperty(task.status)) {
        statusCounts[task.status]++;
      }
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('_', ' '),
      value: count,
    }));
  };

  const getTasksByPriority = () => {
    const priorityCounts = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    tasks.forEach((task) => {
      if (priorityCounts.hasOwnProperty(task.priority)) {
        priorityCounts[task.priority]++;
      }
    });

    return Object.entries(priorityCounts).map(([priority, count]) => ({
      priority,
      count,
    }));
  };

  const getTasksByAssignee = () => {
    const assigneeCounts = {};

    tasks.forEach((task) => {
      const assigneeName = task.assignee?.fullName || 'Unassigned';
      assigneeCounts[assigneeName] = (assigneeCounts[assigneeName] || 0) + 1;
    });

    return Object.entries(assigneeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10
  };

  const getOverallStats = () => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'DONE').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const critical = tasks.filter((t) => t.priority === 'CRITICAL').length;

    return { total, completed, inProgress, critical };
  };

  const stats = getOverallStats();

  // Chart colors
  const STATUS_COLORS = {
    'BACKLOG': '#9CA3AF',
    'TODO': '#3B82F6',
    'IN PROGRESS': '#F59E0B',
    'REVIEW': '#8B5CF6',
    'DONE': '#10B981',
  };

  const PRIORITY_COLORS = {
    CRITICAL: '#EF4444',
    HIGH: '#F59E0B',
    MEDIUM: '#F59E0B',
    LOW: '#9CA3AF',
  };

  if (!selectedProject) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-legion-navy mb-6">Reports & Analytics</h1>
        <div className="flex items-center gap-4 mb-6">
          <ProjectSelector
            selectedProject={selectedProject}
            onProjectChange={setSelectedProject}
          />
        </div>
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">Please select a project to view reports</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-legion-navy">Reports & Analytics</h1>
      </div>

      {/* Project Selector */}
      <div className="mb-6">
        <ProjectSelector
          selectedProject={selectedProject}
          onProjectChange={setSelectedProject}
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading reports...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                  <p className="text-3xl font-bold text-legion-navy mt-2">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-legion-tech-blue bg-opacity-10 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-legion-tech-blue" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% done
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.inProgress}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Critical Priority</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stats.critical}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔴</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Tasks by Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-legion-navy mb-4">Tasks by Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getTasksByStatus()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getTasksByStatus().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Tasks by Priority */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-legion-navy mb-4">Tasks by Priority</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getTasksByPriority()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#B8956A">
                    {getTasksByPriority().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tasks by Assignee */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-legion-navy mb-4">
              Team Workload (Top 10 Assignees)
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={getTasksByAssignee()} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#4A7C9C" name="Tasks Assigned" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;