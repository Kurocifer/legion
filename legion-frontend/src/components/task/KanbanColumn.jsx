import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

const KanbanColumn = ({ status, tasks, onTaskClick, onAddTask }) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const statusConfig = {
    BACKLOG: { label: 'Backlog', color: 'bg-gray-100', textColor: 'text-gray-700' },
    TODO: { label: 'To Do', color: 'bg-blue-100', textColor: 'text-blue-700' },
    IN_PROGRESS: { label: 'In Progress', color: 'bg-yellow-100', textColor: 'text-yellow-700' },
    REVIEW: { label: 'Review', color: 'bg-purple-100', textColor: 'text-purple-700' },
    DONE: { label: 'Done', color: 'bg-green-100', textColor: 'text-green-700' },
  };

  const config = statusConfig[status] || statusConfig.TODO;

  return (
    <div className="flex-shrink-0 w-72 bg-gray-50 rounded-lg p-4">
      {/* Column Header */}
      <div className={`${config.color} ${config.textColor} rounded-lg px-3 py-2 mb-4 flex items-center justify-between`}>
        <h3 className="font-semibold text-sm">{config.label}</h3>
        <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Droppable Area */}
      <div 
        ref={setNodeRef} 
        className={`min-h-[200px] rounded-lg transition-colors ${
          isOver ? 'bg-legion-gold bg-opacity-10 border-2 border-dashed border-legion-gold' : ''
        }`}
      >
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onClick={onTaskClick} 
          />
        ))}
      </div>

      {/* Add Task Button */}
      <button
        onClick={() => onAddTask(status)}
        className="w-full mt-3 py-2 text-sm text-gray-600 hover:text-legion-navy hover:bg-white rounded-lg border border-dashed border-gray-300 hover:border-legion-gold transition-all flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        Add Task
      </button>
    </div>
  );
};

export default KanbanColumn;