package com.legion.project;

import com.legion.common.context.WorkspaceContextHelper;
import com.legion.common.exception.DuplicateResourceException;
import com.legion.common.exception.ResourceNotFoundException;
import com.legion.workspace.Workspace;
import com.legion.workspace.WorkspaceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectService {

    private static final Logger log = LoggerFactory.getLogger(ProjectService.class);

    private final ProjectRepository projectRepository;
    private final WorkspaceRepository workspaceRepository;

    public ProjectService(ProjectRepository projectRepository,
                          WorkspaceRepository workspaceRepository) {
        this.projectRepository = projectRepository;
        this.workspaceRepository = workspaceRepository;
    }

    @Transactional
    public Project createProject(String name, String key, String description) {

        Long workspaceId = WorkspaceContextHelper.requireWorkspaceId();

        log.info(
                "Creating project name={} key={} workspaceId={}",
                name,
                key,
                workspaceId
        );

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", workspaceId));

        if (projectRepository.existsByWorkspaceIdAndKey(workspaceId, key)) {
            log.warn(
                    "Project creation failed: duplicate key={} workspaceId={}",
                    key,
                    workspaceId
            );
            throw new DuplicateResourceException("Project", "key", key);
        }

        Project project = new Project(name, key, description);
        project.setWorkspace(workspace);

        Project saved = projectRepository.save(project);

        log.info(
                "Project created id={} key={} workspaceId={}",
                saved.getId(),
                saved.getKey(),
                workspaceId
        );

        return saved;
    }

    public Project getProjectById(Long id) {

        log.debug("Resolving project id={}", id);

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));

        WorkspaceContextHelper.validateWorkspace(project.getWorkspace().getId());

        return project;
    }

    public List<Project> getProjectsInCurrentWorkspace() {

        Long workspaceId = WorkspaceContextHelper.requireWorkspaceId();

        log.debug("Fetching projects for workspaceId={}", workspaceId);

        return projectRepository.findByWorkspaceId(workspaceId);
    }

    @Transactional
    public Project updateProject(Long projectId, String name, String description) {

        log.info("Updating project id={}", projectId);

        Project project = getProjectById(projectId);

        if (name != null) {
            project.setName(name);
        }
        if (description != null) {
            project.setDescription(description);
        }

        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(Long projectId) {

        log.info("Deleting project id={}", projectId);

        Project project = getProjectById(projectId);
        projectRepository.delete(project);
    }
}
