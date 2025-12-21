package com.legion.project;

import com.legion.common.context.WorkspaceContextHelper;
import com.legion.common.exception.DuplicateResourceException;
import com.legion.common.exception.ResourceNotFoundException;
import com.legion.workspace.Workspace;
import com.legion.workspace.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final WorkspaceRepository workspaceRepository;

    public ProjectService(ProjectRepository projectRepository,
                          WorkspaceRepository workspaceRepository) {
        this.projectRepository = projectRepository;
        this.workspaceRepository = workspaceRepository;
    }

    /**
     * Creates a new project in the current workspace.
     */
    @Transactional
    public Project createProject(String name, String key, String description) {

        Long workspaceId = WorkspaceContextHelper.requireWorkspaceId();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", workspaceId));

        if (projectRepository.existsByWorkspaceIdAndKey(workspaceId, key)) {
            throw new DuplicateResourceException("Project", "key", key);
        }

        Project project = new Project(name, key, description);
        project.setWorkspace(workspace);

        return projectRepository.save(project);
    }

    /**
     * Gets a project by ID with workspace validation.
     */
    public Project getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));

        // Validate project belongs to current workspace
        WorkspaceContextHelper.validateWorkspace(project.getWorkspace().getId());

        return project;
    }

    /**
     * Gets all projects in the current workspace.
     */
    public List<Project> getProjectsInCurrentWorkspace() {
        Long workspaceId = WorkspaceContextHelper.requireWorkspaceId();
        return projectRepository.findByWorkspaceId(workspaceId);
    }

    /**
     * Updates a project with workspace validation.
     */
    @Transactional
    public Project updateProject(Long projectId, String name, String description) {
        Project project = getProjectById(projectId);

        if (name != null) {
            project.setName(name);
        }
        if (description != null) {
            project.setDescription(description);
        }

        return projectRepository.save(project);
    }

    /**
     * Deletes a project with workspace validation.
     * Cascades to delete all tasks and sprints in the project.
     */
    @Transactional
    public void deleteProject(Long projectId) {
        Project project = getProjectById(projectId);
        projectRepository.delete(project);
    }
}