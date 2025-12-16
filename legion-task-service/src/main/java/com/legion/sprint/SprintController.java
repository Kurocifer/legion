package com.legion.sprint;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sprints")
public class SprintController {

    private final SprintService sprintService;

    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    @PostMapping
    public ResponseEntity<Sprint> createSprint(@RequestBody CreateSprintRequest request) {
        Sprint sprint = sprintService.createSprint(
                request.getProjectId(),
                request.getName(),
                request.getStartDate(),
                request.getEndDate()
        );
        return new ResponseEntity<>(sprint, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sprint> getSprintById(@PathVariable Long id) {
        Sprint sprint = sprintService.getSprintById(id);
        return ResponseEntity.ok(sprint);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Sprint>> getSprintsByProject(@PathVariable Long projectId) {
        List<Sprint> sprints = sprintService.getSprintsByProject(projectId);
        return ResponseEntity.ok(sprints);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Sprint> updateSprintStatus(
            @PathVariable Long id,
            @RequestBody UpdateSprintStatusRequest request) {
        Sprint sprint = sprintService.updateSprintStatus(id, request.getStatus());
        return ResponseEntity.ok(sprint);
    }

    // DTOs
    @Setter
    @Getter
    public static class CreateSprintRequest {
        private Long projectId;
        private String name;
        private LocalDate startDate;
        private LocalDate endDate;

    }

    @Setter
    @Getter
    public static class UpdateSprintStatusRequest {
        private SprintStatus status;

    }
}