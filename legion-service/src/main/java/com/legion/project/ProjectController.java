package com.legion.project;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@RestController
@RequestMapping("/legion/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody CreateProjectRequest request) {
        Project project = projectService.createProject(
                request.getWorkspaceId(),
                request.getName(),
                request.getKey(),
                request.getDescription()
        );
        return new ResponseEntity<>(project, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        Project project = projectService.getProjectById(id);
        return ResponseEntity.ok(project);
    }

    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<Project>> getProjectsByWorkspace(@PathVariable Long workspaceId) {
        List<Project> projects = projectService.getProjectsByWorkspace(workspaceId);
        return ResponseEntity.ok(projects);
    }

    // DTO for request
    @Setter
    @Getter
    public static class CreateProjectRequest {
        private Long workspaceId;
        private String name;
        private String key;
        private String description;

    }
}