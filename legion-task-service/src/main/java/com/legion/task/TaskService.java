package com.legion.task;

import com.legion.project.Project;
import com.legion.project.ProjectRepository;
import com.legion.user.User;
import com.legion.user.UserRepository;
import jakarta.transaction.Transactional;

import java.util.List;

public class TaskService {

    private final TaskRepository taskRepo;
    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;

    public TaskService(TaskRepository taskRepo,
                       ProjectRepository projectRepo,
                       UserRepository userRepo) {
        this.taskRepo = taskRepo;
        this.projectRepo = projectRepo;
        this.userRepo = userRepo;
    }

    /**
     * Create a new task with auto-increment task number,
     * ensuring each task has a unique identification for a project
     */
    @Transactional
    public Task createTask(Long projectId, Long reporterId, String title,
                           String description, TaskStatus status, Priority priority,
                           Long assignedId) {
        
        // validate the existence of the project
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Validate reporter exists
        User reporter = userRepo.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Reporter not found"));

        // Validate reporter belongs to same workspace as project
        if (!reporter.getWorkspace().getId().equals(project.getWorkspace().getId())) {
            throw new RuntimeException("Reporter must belong to project's workspace");
        }

        // Validate assignee if provided
        User assignee = null;
        if (assignedId != null) {
            assignee = userRepo.findById(assignedId)
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));

            // Check assignee is in same workspace
            if (!assignee.getWorkspace().getId().equals(project.getWorkspace().getId())) {
                throw new RuntimeException("Assignee must belong to project's workspace");
            }
        }

        // Auto generate task number
        Integer maxTaskNumber = taskRepo.findMaxTaskNumberByProjectId(projectId);
        Integer nextTaskNumber = maxTaskNumber + 1;

        // Create Task
        Task task = new Task();
        task.setProject(project);
        task.setReporter(reporter);
        task.setAssignee(assignee);
        task.setTitle(title);
        task.setDescription(description);
        task.setStatus(status);
        task.setPriority(priority);
        task.setTaskNumber(nextTaskNumber);

        return taskRepo.save(task);
    }

    /**
     * Get all tasks for a project
     */
    public List<Task> getTasksByProject(Long projectId) {
        return taskRepo.findByProjectId(projectId);
    }

    /**
     * Get all tasks for a sprint
     */
    public List<Task> getTasksBySprint(Long sprintId) {
        return taskRepo.findBySprintId(sprintId);
    }

    /**
     * Get all tasks assigned to a user
     */
    public List<Task> getTasksByAssignee(Long assigneeId) {
        return taskRepo.findByAssigneeId(assigneeId);
    }

    /**
     * Update task status
     */
    @Transactional
    public Task updateTaskStatus(Long taskId, TaskStatus newStatus) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setStatus(newStatus);
        return taskRepo.save(task);
    }

    /**
     * Assign task to sprint
     */
    @Transactional
    public Task assignTaskToSprint(Long taskId, Long sprintId) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // TODO: Add Sprint validation
        task.setSprint(null);
        return taskRepo.save(task);
    }
}
