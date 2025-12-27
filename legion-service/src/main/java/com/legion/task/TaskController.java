package com.legion.task;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private static final Logger log = LoggerFactory.getLogger(TaskController.class);

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody CreateTaskRequest request) {
        log.info("POST /api/tasks projectId={}", request.getProjectId());

        Task task = taskService.createTask(
                request.getProjectId(),
                request.getReporterId(),
                request.getTitle(),
                request.getDescription(),
                request.getStatus(),
                request.getPriority(),
                request.getAssigneeId()
        );
        return new ResponseEntity<>(task, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        log.debug("GET /api/tasks/{}", id);
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        log.debug("GET /api/tasks");
        return ResponseEntity.ok(taskService.getAllTasksInWorkspace());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getTasksByProject(@PathVariable Long projectId) {
        log.debug("GET /api/tasks/project/{}", projectId);
        return ResponseEntity.ok(taskService.getTasksByProject(projectId));
    }

    @GetMapping("/sprint/{sprintId}")
    public ResponseEntity<List<Task>> getTasksBySprint(@PathVariable Long sprintId) {
        log.debug("GET /api/tasks/sprint/{}", sprintId);
        return ResponseEntity.ok(taskService.getTasksBySprint(sprintId));
    }

    @GetMapping("/assignee/{assigneeId}")
    public ResponseEntity<List<Task>> getTasksByAssignee(@PathVariable Long assigneeId) {
        log.debug("GET /api/tasks/assignee/{}", assigneeId);
        return ResponseEntity.ok(taskService.getTasksByAssignee(assigneeId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(
            @PathVariable Long id,
            @RequestBody UpdateTaskStatusRequest request) {
        log.info("PATCH /api/tasks/{}/status {}", id, request.getStatus());
        return ResponseEntity.ok(taskService.updateTaskStatus(id, request.getStatus()));
    }

    @PatchMapping("/{id}/sprint")
    public ResponseEntity<Task> assignTaskToSprint(
            @PathVariable Long id,
            @RequestBody AssignTaskToSprintRequest request) {
        log.info("PATCH /api/tasks/{}/sprint {}", id, request.getSprintId());
        return ResponseEntity.ok(taskService.assignTaskToSprint(id, request.getSprintId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long id,
            @RequestBody UpdateTaskRequest request) {
        log.info("PUT /api/tasks/{}", id);
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @PatchMapping("/{id}/assignee")
    public ResponseEntity<Task> assignTaskToUser(
            @PathVariable Long id,
            @RequestBody AssignTaskToUserRequest request) {
        log.info("PATCH /api/tasks/{}/assignee {}", id, request.getAssigneeId());
        return ResponseEntity.ok(taskService.updateTaskAssignee(id, request.getAssigneeId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        log.info("DELETE /api/tasks/{}", id);
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @Setter @Getter
    public static class CreateTaskRequest {
        private Long projectId;
        private Long reporterId;
        private String title;
        private String description;
        private TaskStatus status;
        private Priority priority;
        private Long assigneeId;
    }

    @Setter @Getter
    public static class UpdateTaskStatusRequest {
        private TaskStatus status;
    }

    @Setter @Getter
    public static class AssignTaskToSprintRequest {
        private Long sprintId;
    }

    @Setter @Getter
    public static class UpdateTaskRequest {
        private String title;
        private String description;
        private Priority priority;
    }

    @Setter @Getter
    public static class AssignTaskToUserRequest {
        private Long assigneeId;
    }
}
