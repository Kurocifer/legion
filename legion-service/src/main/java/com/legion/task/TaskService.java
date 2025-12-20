package com.legion.task;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import com.legion.common.exception.InvalidOperationException;
import com.legion.common.exception.ResourceNotFoundException;
import com.legion.common.exception.UnauthorizedException;
import com.legion.config.TaskConfig;
import com.legion.project.Project;
import com.legion.project.ProjectRepository;
import com.legion.sprint.Sprint;
import com.legion.sprint.SprintRepository;
import com.legion.user.User;
import com.legion.user.UserRepository;
import com.legion.workspace.WorkspaceMemberRepository;
import jakarta.transaction.Transactional;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepo;
    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;
    private final TaskConfig taskConfig;
    private final SprintRepository sprintRepo;
    private final WorkspaceMemberRepository workspaceMemberRepo;

    public TaskService(TaskRepository taskRepo,
                       ProjectRepository projectRepo,
                       UserRepository userRepo,
                       TaskConfig taskConfig, SprintRepository sprintRepo,
                       WorkspaceMemberRepository workspaceMemberRepo) {
        this.taskRepo = taskRepo;
        this.projectRepo = projectRepo;
        this.userRepo = userRepo;
        this.taskConfig = taskConfig;
        this.sprintRepo = sprintRepo;
        this.workspaceMemberRepo = workspaceMemberRepo;
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
                    throw new InvalidOperationException(
                            "Failed to create task after " + maxRetries + " attempts. Please try again.", e);
                }

                try {
                    Thread.sleep(retryDelay);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new InvalidOperationException("Task creation interrupted", ie);
                }
            }
        }

        throw new InvalidOperationException("Failed to create task");
    }

    private Task attemptCreateTask(Long projectId, Long reporterId, String title,
                                   String description, TaskStatus status,
                                   Priority priority, Long assigneeId) {

        // Use custom exceptions instead of RuntimeException
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        User reporter = userRepo.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", reporterId));

        if (!workspaceMemberRepo.existsByUserIdAndWorkspaceId(reporterId, project.getWorkspace().getId())) {
            throw new UnauthorizedException("You must be a member of this workspace");
        }

        User assignee = null;
        if (assigneeId != null) {
            assignee = userRepo.findById(assigneeId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", assigneeId));

            if (!workspaceMemberRepo.existsByUserIdAndWorkspaceId(assigneeId, project.getWorkspace().getId())) {
                throw new UnauthorizedException("Assignee must belong to project's workspace");
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
                .orElseThrow(() -> new ResourceNotFoundException("Task not found", taskId));

        task.setStatus(newStatus);
        return taskRepo.save(task);
    }

    /**
     * Assign task to sprint
     */
    @Transactional
    public Task assignTaskToSprint(Long taskId, Long sprintId) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found", taskId));

        Sprint sprint = sprintRepo.findById(sprintId)
                        .orElseThrow(() -> new ResourceNotFoundException("Spring not found", sprintId));

        task.setSprint(sprint);
        return taskRepo.save(task);
    }

    public Task getTaskById(Long taskId) {
        return taskRepo.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
    }
}
