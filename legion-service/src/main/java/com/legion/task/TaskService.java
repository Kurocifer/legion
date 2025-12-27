package com.legion.task;

import com.legion.common.context.WorkspaceContext;
import com.legion.common.context.WorkspaceContextHelper;
import com.legion.common.exception.*;
import com.legion.config.TaskConfig;
import com.legion.project.Project;
import com.legion.project.ProjectRepository;
import com.legion.sprint.Sprint;
import com.legion.sprint.SprintRepository;
import com.legion.user.User;
import com.legion.user.UserRepository;
import com.legion.workspace.WorkspaceMemberRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final TaskConfig taskConfig;

    public TaskService(TaskRepository taskRepository,
                       ProjectRepository projectRepository,
                       SprintRepository sprintRepository,
                       UserRepository userRepository,
                       WorkspaceMemberRepository workspaceMemberRepository,
                       TaskConfig taskConfig) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.sprintRepository = sprintRepository;
        this.userRepository = userRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.taskConfig = taskConfig;
    }

    /**
     * Creates a new task with workspace validation and auto-incremented task number.
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

        // Validate project exists
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        // Validate project belongs to current workspace
        WorkspaceContextHelper.validateWorkspace(project.getWorkspace().getId());

        // Validate reporter exists
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", reporterId));

        // Validate reporter is in current workspace
        Long workspaceId = WorkspaceContext.getWorkspaceId();
        if (!workspaceMemberRepository.existsByUserIdAndWorkspaceId(reporter.getId(), workspaceId)) {
            throw new UnauthorizedException("You must be a member of this workspace");
        }

        // Validate assignee if provided
        User assignee = null;
        if (assigneeId != null) {
            assignee = userRepository.findById(assigneeId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", assigneeId));

            if (!workspaceMemberRepository.existsByUserIdAndWorkspaceId(assignee.getId(), workspaceId)) {
                throw new UnauthorizedException("Assignee must be a member of this workspace");
            }
        }

        // Auto-generate task number
        Integer maxTaskNumber = taskRepository.findMaxTaskNumberByProjectId(projectId);
        Integer nextTaskNumber = maxTaskNumber + 1;

        // Create task
        Task task = new Task();
        task.setProject(project);
        task.setReporter(reporter);
        task.setAssignee(assignee);
        task.setTitle(title);
        task.setDescription(description);
        task.setStatus(status);
        task.setPriority(priority);
        task.setTaskNumber(nextTaskNumber);

        return taskRepository.save(task);
    }

    /**
     * Gets a task by ID with workspace validation.
     */
    public Task getTaskById(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));

        // Validate task belongs to current workspace
        WorkspaceContextHelper.validateWorkspace(task.getProject().getWorkspace().getId());

        return task;
    }

    /**
     * Gets all tasks for a project with workspace validation.
     */
    public List<Task> getTasksByProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        // Validate project belongs to current workspace
        WorkspaceContextHelper.validateWorkspace(project.getWorkspace().getId());

        return taskRepository.findByProjectId(projectId);
    }

    /**
     * Gets all tasks for a sprint with workspace validation.
     */
    public List<Task> getTasksBySprint(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", sprintId));

        // Validate sprint's project belongs to current workspace
        WorkspaceContextHelper.validateWorkspace(sprint.getProject().getWorkspace().getId());

        return taskRepository.findBySprintId(sprintId);
    }

    /**
     * Gets all tasks assigned to a user in current workspace.
     */
    public List<Task> getTasksByAssignee(Long assigneeId) {
        // Validate assignee exists
        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new ResourceNotFoundException("User", assigneeId));

        // Validate assignee is in current workspace
        Long workspaceId = WorkspaceContextHelper.requireWorkspaceId();
        if (!workspaceMemberRepository.existsByUserIdAndWorkspaceId(assignee.getId(), workspaceId)) {
            throw new UnauthorizedException("User is not a member of this workspace");
        }

        return taskRepository.findByAssigneeId(assigneeId);
    }

    /**
     * Updates task status with workspace validation.
     */
    @Transactional
    public Task updateTaskStatus(Long taskId, TaskStatus newStatus) {
        Task task = getTaskById(taskId);
        task.setStatus(newStatus);
        return taskRepository.save(task);
    }

    /**
     * Assigns task to sprint with workspace validation.
     */
    @Transactional
    public Task assignTaskToSprint(Long taskId, Long sprintId) {
        Task task = getTaskById(taskId);

        if (sprintId != null) {
            Sprint sprint = sprintRepository.findById(sprintId)
                    .orElseThrow(() -> new ResourceNotFoundException("Sprint", sprintId));

            WorkspaceContextHelper.validateWorkspace(sprint.getProject().getWorkspace().getId());

            // validated task and sprint are in same project
            if (!task.getProject().getId().equals(sprint.getProject().getId())) {
                throw new InvalidOperationException("Task and sprint must be in the same project");
            }

            task.setSprint(sprint);
        } else {
            // Unassign from sprint
            task.setSprint(null);
        }

        return taskRepository.save(task);
    }

    /**
     * Updates task assignee with workspace validation.
     */
    @Transactional
    public Task updateTaskAssignee(Long taskId, Long assigneeId) {
        Task task = getTaskById(taskId);

        if (assigneeId != null) {
            User assignee = userRepository.findById(assigneeId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", assigneeId));

            // Validate assignee is in current workspace
            Long workspaceId = WorkspaceContext.getWorkspaceId();
            if (!workspaceMemberRepository.existsByUserIdAndWorkspaceId(assignee.getId(), workspaceId)) {
                throw new UnauthorizedException("Assignee must be a member of this workspace");
            }

            task.setAssignee(assignee);
        } else {
            // Unassign
            task.setAssignee(null);
        }

        return taskRepository.save(task);
    }

    /**
     * Deletes a task with workspace validation.
     */
    @Transactional
    public void deleteTask(Long taskId) {
        Task task = getTaskById(taskId);
        taskRepository.delete(task);
    }

    /**
     * Gets all tasks in current workspace.
     */
    public List<Task> getAllTasksInWorkspace() {
        Long workspaceId = WorkspaceContextHelper.requireWorkspaceId();
        return taskRepository.findAllByWorkspaceId(workspaceId);
    }

    /**
     * Updates task details (title, description, priority).
     */
    @Transactional
    public Task updateTask(Long taskId, TaskController.UpdateTaskRequest request) {
        Task task = getTaskById(taskId);

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            task.setTitle(request.getTitle().trim());
        }

        if (request.getDescription() != null) {
            task.setDescription(request.getDescription().trim());
        }

        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }

        return taskRepository.save(task);
    }
}