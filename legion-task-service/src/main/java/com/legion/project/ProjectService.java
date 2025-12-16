package com.legion.project;

import com.legion.common.exception.DuplicateResourceException;
import com.legion.common.exception.ResourceNotFoundException;
import com.legion.workspace.Workspace;
import com.legion.workspace.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepo;
    private final WorkspaceRepository workspaceRepo;

    public ProjectService(ProjectRepository projectRepo,
                          WorkspaceRepository workspaceRepo) {
        this.projectRepo = projectRepo;
        this.workspaceRepo = workspaceRepo;
    }

    @Transactional
    public Project createProject(Long workspaceId, String name, String key, String description) {

        Workspace workspace = workspaceRepo.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found", workspaceId));

        if (projectRepo.existsByWorkspaceIdAndKey(workspaceId, key)) {
            throw new DuplicateResourceException("project", "Key", key);
        }

        Project project = new Project(name, key, description);
        project.setWorkspace(workspace);

        return projectRepo.save(project);
    }

    public Project getProjectById(Long id) {
        return projectRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
    }

    public List<Project> getProjectsByWorkspace(Long workspaceId) {
        return projectRepo.findByWorkspaceId(workspaceId);
    }
}