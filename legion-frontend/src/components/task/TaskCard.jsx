import { useDraggable } from '@dnd-kit/core';
import { Calendar, User } from 'lucide-react';

const TaskCard = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ 
    id: task.id,
    data: { task }
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityDot = (priority) => {
    const dots = {
      CRITICAL: '🔴',
      HIGH: '🟠',
      MEDIUM: '🟡',
      LOW: '⚪',
    };
    return dots[priority] || '⚪';
  };

  const handleCardClick = (e) => {
    // Click should not be triggered when dragging
    if (!isDragging) {
      onClick(task);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-3 mb-3 hover:shadow-lg hover:border-legion-tech-blue transition-all"
    >
      {/* Drag handle area - top portion only */}
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-gray-500">
            {task.project?.key}-{task.taskNumber}
          </span>
          <span className="text-xs">
            {getPriorityDot(task.priority)}
          </span>
        </div>
      </div>

      {/* Clickablecontent - No drag listeners */}
      <div onClick={handleCardClick} className="cursor-pointer">
        <h4 className="text-sm font-semibold text-legion-navy mb-2 line-clamp-2">
          {task.title}
        </h4>

        <div className="flex items-center justify-between text-xs text-gray-500">
          {task.assignee && (
            <div className="flex items-center gap-1">
              <User size={12} />
              <span>{task.assignee.fullName}</span>
            </div>
          )}
          {task.sprint && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{task.sprint.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;