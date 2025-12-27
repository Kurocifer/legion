import { useState, useEffect } from 'react';
import { LayoutGrid, TrendingUp, CheckCircle, Clock, AlertCircle, Users } from 'lucide-react';
import { taskAPI } from '../api/task';
import { projectAPI } from '../api/project';
import { userAPI } from '../api/user';
import useWorkspaceStore from '../store/workspaceStore';

const Dashboard = () => {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (currentWorkspace) {
      loadData();
    }
  }, [currentWorkspace]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksData, projectsData, membersData] = await Promise.all([
        taskAPI.getAllTasks(),
        projectAPI.getProjectsByWorkspace(currentWorkspace.workspace.id),
        userAPI.getWorkspaceMembers(currentWorkspace.workspace.id),
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
      setMembers(membersData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const todoTasks = tasks.filter((t) => t.status === 'TODO').length;
  const criticalTasks = tasks.filter((t) => t.priority === 'CRITICAL').length;

  const tasksByStatus = {
    BACKLOG: tasks.filter((t) => t.status === 'BACKLOG').length,
    TODO: todoTasks,
    IN_PROGRESS: inProgressTasks,
    REVIEW: tasks.filter((t) => t.status === 'REVIEW').length,
    DONE: completedTasks,
  };

  const tasksByPriority = {
    CRITICAL: criticalTasks,
    HIGH: tasks.filter((t) => t.priority === 'HIGH').length,
    MEDIUM: tasks.filter((t) => t.priority === 'MEDIUM').length,
    LOW: tasks.filter((t) => t.priority === 'LOW').length,
  };

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-legion-navy">{value}</p>
        </div>
        <div className={`${bgColor} ${color} p-4 rounded-lg`}>
          <Icon size={32} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-legion-navy flex items-center gap-3">
          <LayoutGrid size={32} />
          Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Welcome to {currentWorkspace?.workspace.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={CheckCircle}
          label="Total Tasks"
          value={totalTasks}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={Clock}
          label="In Progress"
          value={inProgressTasks}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
        <StatCard
          icon={TrendingUp}
          label="Completed"
          value={completedTasks}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          icon={AlertCircle}
          label="Critical"
          value={criticalTasks}
          color="text-red-600"
          bgColor="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-legion-navy mb-4">Tasks by Status</h2>
          <div className="space-y-4">
            {Object.entries(tasksByStatus).map(([status, count]) => {
              const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
              const colors = {
                BACKLOG: 'bg-gray-400',
                TODO: 'bg-blue-500',
                IN_PROGRESS: 'bg-yellow-500',
                REVIEW: 'bg-purple-500',
                DONE: 'bg-green-500',
              };
              return (
                <div key={status}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {status.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${colors[status]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks by Priority */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-legion-navy mb-4">Tasks by Priority</h2>
          <div className="space-y-4">
            {Object.entries(tasksByPriority).map(([priority, count]) => {
              const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
              const colors = {
                CRITICAL: 'bg-red-500',
                HIGH: 'bg-orange-500',
                MEDIUM: 'bg-yellow-500',
                LOW: 'bg-gray-400',
              };
              return (
                <div key={priority}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{priority}</span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${colors[priority]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-legion-navy mb-4">Completion Rate</h2>
          <div className="flex items-center justify-center h-40">
            <div className="relative">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#10B981"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(completionRate / 100) * 352} 352`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-legion-navy">{completionRate}%</span>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-4">
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </div>

        {/* Team Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-legion-navy mb-4 flex items-center gap-2">
            <Users size={20} />
            Team Overview
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total Members</span>
              <span className="text-2xl font-bold text-legion-navy">{members.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total Projects</span>
              <span className="text-2xl font-bold text-legion-navy">{projects.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Active Tasks</span>
              <span className="text-2xl font-bold text-legion-navy">
                {inProgressTasks + todoTasks}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;