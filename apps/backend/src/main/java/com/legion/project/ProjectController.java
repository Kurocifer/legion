package com.legion.project;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@RestController
@RequestMapping("api/projects")
public class ProjectController {

    private static final Logger log = LoggerFactory.getLogger(ProjectController.class);

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody CreateProjectRequest request) {

        log.info(
                "Project creation attempt name={} key={}",
                request.getName(),
                request.getKey()
        );

        Project project = projectService.createProject(
                request.getName(),
                request.getKey(),
                request.getDescription()
        );

        log.info(
                "Project created id={} key={}",
                project.getId(),
                project.getKey()
        );

        return new ResponseEntity<>(project, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {

        log.debug("Fetching project id={}", id);

        Project project = projectService.getProjectById(id);

        return ResponseEntity.ok(project);
    }

    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<Project>> getProjectsByWorkspace(@PathVariable Long workspaceId) {

        log.debug("Fetching projects for workspaceId={}", workspaceId);

        List<Project> projects = projectService.getProjectsInCurrentWorkspace();

        log.info(
                "Fetched {} projects for workspaceId={}",
                projects.size(),
                workspaceId
        );

        return ResponseEntity.ok(projects);
    }

    @Setter
    @Getter
    public static class CreateProjectRequest {
        private Long workspaceId;
        private String name;
        private String key;
        private String description;
    }
}
