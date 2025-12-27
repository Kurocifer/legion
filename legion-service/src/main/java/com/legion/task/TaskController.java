package com.legion.task;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody CreateTaskRequest request) {
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
        Task task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }

    // NEW: Get all tasks in workspace
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        List<Task> tasks = taskService.getAllTasksInWorkspace();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getTasksByProject(@PathVariable Long projectId) {
        List<Task> tasks = taskService.getTasksByProject(projectId);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/sprint/{sprintId}")
    public ResponseEntity<List<Task>> getTasksBySprint(@PathVariable Long sprintId) {
        List<Task> tasks = taskService.getTasksBySprint(sprintId);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/assignee/{assigneeId}")
    public ResponseEntity<List<Task>> getTasksByAssignee(@PathVariable Long assigneeId) {
        List<Task> tasks = taskService.getTasksByAssignee(assigneeId);
        return ResponseEntity.ok(tasks);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(
            @PathVariable Long id,
            @RequestBody UpdateTaskStatusRequest request) {
        Task task = taskService.updateTaskStatus(id, request.getStatus());
        return ResponseEntity.ok(task);
    }

    @PatchMapping("/{id}/sprint")
    public ResponseEntity<Task> assignTaskToSprint(
            @PathVariable Long id,
            @RequestBody AssignTaskToSprintRequest request) {
        Task task = taskService.assignTaskToSprint(id, request.getSprintId());
        return ResponseEntity.ok(task);
    }

    // NEW: Update task details
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long id,
            @RequestBody UpdateTaskRequest request) {
        Task task = taskService.updateTask(id, request);
        return ResponseEntity.ok(task);
    }

    // NEW: Update task assignee
    @PatchMapping("/{id}/assignee")
    public ResponseEntity<Task> assignTaskToUser(
            @PathVariable Long id,
            @RequestBody AssignTaskToUserRequest request) {
        Task task = taskService.updateTaskAssignee(id, request.getAssigneeId());
        return ResponseEntity.ok(task);
    }

    // NEW: Delete task
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    // DTOs
    @Setter
    @Getter
    public static class CreateTaskRequest {
        private Long projectId;
        private Long reporterId;
        private String title;
        private String description;
        private TaskStatus status;
        private Priority priority;
        private Long assigneeId;
    }

    @Setter
    @Getter
    public static class UpdateTaskStatusRequest {
        private TaskStatus status;
    }

    @Setter
    @Getter
    public static class AssignTaskToSprintRequest {
        private Long sprintId;
    }

    @Setter
    @Getter
    public static class UpdateTaskRequest {
        private String title;
        private String description;
        private Priority priority;
    }

    @Setter
    @Getter
    public static class AssignTaskToUserRequest {
        private Long assigneeId;
    }
}