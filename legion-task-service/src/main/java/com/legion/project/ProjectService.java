package com.legion.project;

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
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        if (projectRepo.existsByWorkspaceIdAndKey(workspaceId, key)) {
            throw new RuntimeException("Project with key '" + key + "' already exists in this workspace");
        }

        Project project = new Project(name, key, description);
        project.setWorkspace(workspace);

        return projectRepo.save(project);
    }

    public Project getProjectById(Long id) {
        return projectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    public List<Project> getProjectsByWorkspace(Long workspaceId) {
        return projectRepo.findByWorkspaceId(workspaceId);
    }
}