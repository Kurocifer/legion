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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {

    private static final Logger log = LoggerFactory.getLogger(TaskService.class);

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

    @Transactional
    public Task createTask(Long projectId, Long reporterId, String title,
                           String description, TaskStatus status, Priority priority,
                           Long assigneeId) {

        log.info("Creating task for projectId={}, reporterId={}, assigneeId={}",
                projectId, reporterId, assigneeId);

        int maxRetries = taskConfig.getCreationRetryAttempts();
        long retryDelay = taskConfig.getCreationRetryDelayMs();
        int attempt = 0;

        while (attempt < maxRetries) {
            try {
                return attemptCreateTask(projectId, reporterId, title, description,
                        status, priority, assigneeId);
            } catch (DataIntegrityViolationException e) {
                attempt++;
                log.warn("Task creation attempt {} failed due to data integrity violation", attempt);

                if (attempt >= maxRetries) {
                    log.error("Task creation failed after {} attempts", maxRetries, e);
                    throw new InvalidOperationException(
                            "Failed to create task after " + maxRetries + " attempts. Please try again.", e);
                }

                try {
                    Thread.sleep(retryDelay);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    log.error("Task creation interrupted", ie);
                    throw new InvalidOperationException("Task creation interrupted", ie);
                }
            }
        }

        throw new InvalidOperationException("Failed to create task");
    }

    private Task attemptCreateTask(Long projectId, Long reporterId, String title,
                                   String description, TaskStatus status,
                                   Priority priority, Long assigneeId) {

        log.debug("Attempting task creation for projectId={}", projectId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        WorkspaceContextHelper.validateWorkspace(project.getWorkspace().getId());

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", reporterId));

        Long workspaceId = WorkspaceContext.getWorkspaceId();
        if (!workspaceMemberRepository.existsByUserIdAndWorkspaceId(reporter.getId(), workspaceId)) {
            log.warn("Reporter {} is not member of workspace {}", reporterId, workspaceId);
            throw new UnauthorizedException("You must be a member of this workspace");
        }

        User assignee = null;
        if (assigneeId != null) {
            assignee = userRepository.findById(assigneeId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", assigneeId));

            if (!workspaceMemberRepository.existsByUserIdAndWorkspaceId(assignee.getId(), workspaceId)) {
                log.warn("Assignee {} is not member of workspace {}", assigneeId, workspaceId);
                throw new UnauthorizedException("Assignee must be a member of this workspace");
            }
        }

        Integer maxTaskNumber = taskRepository.findMaxTaskNumberByProjectId(projectId);
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

        Task saved = taskRepository.save(task);
        log.info("Task created successfully with id={} and taskNumber={}",
                saved.getId(), saved.getTaskNumber());

        return saved;
    }

    public Task getTaskById(Long taskId) {
        log.debug("Fetching task id={}", taskId);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));

        WorkspaceContextHelper.validateWorkspace(task.getProject().getWorkspace().getId());
        return task;
    }

    public List<Task> getTasksByProject(Long projectId) {
        log.debug("Fetching tasks for projectId={}", projectId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        WorkspaceContextHelper.validateWorkspace(project.getWorkspace().getId());
        return taskRepository.findByProjectId(projectId);
    }

    public List<Task> getTasksBySprint(Long sprintId) {
        log.debug("Fetching tasks for sprintId={}", sprintId);

        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", sprintId));

        WorkspaceContextHelper.validateWorkspace(sprint.getProject().getWorkspace().getId());
        return taskRepository.findBySprintId(sprintId);
    }

    public List<Task> getTasksByAssignee(Long assigneeId) {
        log.debug("Fetching tasks for assigneeId={}", assigneeId);

        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new ResourceNotFoundException("User", assigneeId));

        Long workspaceId = WorkspaceContextHelper.requireWorkspaceId();
        if (!workspaceMemberRepository.existsByUserIdAndWorkspaceId(assignee.getId(), workspaceId)) {
            log.warn("User {} is not member of workspace {}", assigneeId, workspaceId);
            throw new UnauthorizedException("User is not a member of this workspace");
        }

        return taskRepository.findByAssigneeId(assigneeId);
    }

    @Transactional
    public Task updateTaskStatus(Long taskId, TaskStatus newStatus) {
        log.info("Updating status of taskId={} to {}", taskId, newStatus);

        Task task = getTaskById(taskId);
        task.setStatus(newStatus);
        return taskRepository.save(task);
    }

    @Transactional
    public Task assignTaskToSprint(Long taskId, Long sprintId) {
        log.info("Assigning taskId={} to sprintId={}", taskId, sprintId);

        Task task = getTaskById(taskId);

        if (sprintId != null) {
            Sprint sprint = sprintRepository.findById(sprintId)
                    .orElseThrow(() -> new ResourceNotFoundException("Sprint", sprintId));

            WorkspaceContextHelper.validateWorkspace(sprint.getProject().getWorkspace().getId());

            if (!task.getProject().getId().equals(sprint.getProject().getId())) {
                log.warn("Task {} and sprint {} are not in same project", taskId, sprintId);
                throw new InvalidOperationException("Task and sprint must be in the same project");
            }

            task.setSprint(sprint);
        } else {
            task.setSprint(null);
        }

        return taskRepository.save(task);
    }

    @Transactional
    public Task updateTaskAssignee(Long taskId, Long assigneeId) {
        log.info("Updating assignee of taskId={} to {}", taskId, assigneeId);

        Task task = getTaskById(taskId);

        if (assigneeId != null) {
            User assignee = userRepository.findById(assigneeId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", assigneeId));

            Long workspaceId = WorkspaceContext.getWorkspaceId();
            if (!workspaceMemberRepository.existsByUserIdAndWorkspaceId(assignee.getId(), workspaceId)) {
                log.warn("Assignee {} not member of workspace {}", assigneeId, workspaceId);
                throw new UnauthorizedException("Assignee must be a member of this workspace");
            }

            task.setAssignee(assignee);
        } else {
            task.setAssignee(null);
        }

        return taskRepository.save(task);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        log.info("Deleting task id={}", taskId);

        Task task = getTaskById(taskId);
        taskRepository.delete(task);
    }

    public List<Task> getAllTasksInWorkspace() {
        Long workspaceId = WorkspaceContextHelper.requireWorkspaceId();
        log.debug("Fetching all tasks for workspaceId={}", workspaceId);
        return taskRepository.findAllByWorkspaceId(workspaceId);
    }

    @Transactional
    public Task updateTask(Long taskId, TaskController.UpdateTaskRequest request) {
        log.info("Updating task details for taskId={}", taskId);

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
