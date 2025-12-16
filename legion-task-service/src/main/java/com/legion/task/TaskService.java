package com.legion.task;

import org.springframework.dao.DataIntegrityViolationException;
import com.legion.common.exception.ResourceNotFoundException;
import com.legion.config.TaskConfig;
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
    private final TaskConfig taskConfig;

    public TaskService(TaskRepository taskRepo,
                       ProjectRepository projectRepo,
                       UserRepository userRepo, TaskConfig taskConfig) {
        this.taskRepo = taskRepo;
        this.projectRepo = projectRepo;
        this.userRepo = userRepo;
        this.taskConfig = taskConfig;
    }

    /**
     * Create a new task with auto-increment task number,
     * ensuring each task has a unique identification for a project
     */
    @Transactional
    public Task createTask(Long projectId, Long reporterId, String title,
                           String description, TaskStatus status, Priority priority,
                           Long assigneeId) {

        int maxRetries = taskConfig.getCreationRetryAttempts();
        long retryDelay = taskConfig.getCreationRetryDelayMs();
        int attempt = 0;

        while (attempt < maxRetries) {
            try {
                return attemptCreateTask(projectId, reporterId, title, description,
                        status, priority, assigneeId);
            } catch (DataIntegrityViolationException e) {
                attempt++;
                if (attempt >= maxRetries) {
                    throw new RuntimeException("Failed to create task after " + maxRetries + " attempts", e);
                }

                try {
                    Thread.sleep(retryDelay);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Task creation interrupted", ie);
                }
            }
        }

        throw new RuntimeException("Failed to create task");
    }

    private Task attemptCreateTask(Long projectId, Long reporterId, String title,
                                   String description, TaskStatus status,
                                   Priority priority, Long assigneeId) {

        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User reporter = userRepo.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Reporter not found"));

        if (!reporter.getWorkspace().getId().equals(project.getWorkspace().getId())) {
            throw new RuntimeException("Reporter must belong to project's workspace");
        }

        User assignee = null;
        if (assigneeId != null) {
            assignee = userRepo.findById(assigneeId)
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));

            if (!assignee.getWorkspace().getId().equals(project.getWorkspace().getId())) {
                throw new RuntimeException("Assignee must belong to project's workspace");
            }
        }

        Integer maxTaskNumber = taskRepo.findMaxTaskNumberByProjectId(projectId);
        Integer nextTaskNumber = maxTaskNumber + 1;

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

        // TODO: Later on Add Sprint validation
        task.setSprint(null);
        return taskRepo.save(task);
    }

    public Task getTaskById(Long taskId) {
        return taskRepo.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
    }
}
