import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import ProjectSelector from '../components/project/ProjectSelector';
import SprintSelector from '../components/sprint/SprintSelector';
import KanbanColumn from '../components/task/KanbanColumn';
import TaskCard from '../components/task/TaskCard';
import CreateTaskModal from '../components/task/CreateTaskModal';
import TaskDetailModal from '../components/task/TaskDetailModal';
import { taskAPI } from '../api/task';

const Board = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalStatus, setCreateModalStatus] = useState('BACKLOG');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const statuses = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

  useEffect(() => {
    if (selectedProject) {
      loadTasks();
    }
  }, [selectedProject]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await taskAPI.getTasksByProject(selectedProject.id);
      console.log('Loaded tasks:', data);
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      alert('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) {
      console.log('No drop target');
      return;
    }

    const taskId = active.id;
    const newStatus = over.id;

    console.log('Drag end:', { taskId, newStatus });

    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      console.log('Task not found');
      return;
    }

    if (task.status === newStatus) {
      console.log('Same status, no change needed');
      return;
    }

    console.log(`Moving task ${taskId} from ${task.status} to ${newStatus}`);

    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    );

    // Update backend
    try {
      const updatedTask = await taskAPI.updateTaskStatus(taskId, newStatus);
      console.log('Backend updated:', updatedTask);
    } catch (error) {
      console.log("AAahhah why won't it upate!!!")
      console.error('Failed to update task:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to move task: ' + (error.response?.data?.message || error.message));
      loadTasks();
    }
  };

  const handleTaskClick = (task) => {
    console.log('🔍 Clicked task:', task);
    setSelectedTask(task);
    setDetailModalOpen(true);
  };

  const handleAddTask = (status) => {
    setCreateModalStatus(status);
    setCreateModalOpen(true);
  };

  const handleTaskCreated = (newTask) => {
    setTasks([...tasks, newTask]);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const handleTaskDeleted = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));
  };

  if (!selectedProject) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-legion-navy mb-6">Kanban Board</h1>
        <div className="flex items-center gap-4 mb-6">
          <ProjectSelector
            selectedProject={selectedProject}
            onProjectChange={setSelectedProject}
          />
        </div>
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">Please select a project to view tasks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-legion-navy">Kanban Board</h1>
      </div>

      {/* Selectors */}
      <div className="flex items-center gap-4 mb-6">
        <ProjectSelector
          selectedProject={selectedProject}
          onProjectChange={setSelectedProject}
        />
        <SprintSelector
          projectId={selectedProject?.id}
          selectedSprint={selectedSprint}
          onSprintChange={setSelectedSprint}
        />
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 pb-4">
            {statuses.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={getTasksByStatus(status)}
                onTaskClick={handleTaskClick}
                onAddTask={handleAddTask}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        project={selectedProject}
        defaultStatus={createModalStatus}
        onTaskCreated={handleTaskCreated}
      />

      <TaskDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        task={selectedTask}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <div className="bg-white px-6 py-4 rounded-lg shadow-xl">
            Loading tasks...
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;