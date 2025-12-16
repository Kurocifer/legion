package com.legion.workspace;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;

import java.util.List;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepo;

    public WorkspaceService(WorkspaceRepository workspaceRepo) {
        this.workspaceRepo = workspaceRepo;
    }

    /**
     * Create workspace
     */
    @Transactional
    public Workspace createWorkspace(String name, String slug) {
        if (workspaceRepo.existsBySlug(slug)) {
            throw new RuntimeException("Workspace with slug'" + slug + "alredy exists");
        }

        Workspace workspace = new Workspace(name, slug);
        return workspaceRepo.save(workspace);
    }

    /**
     * Get workspace by Id
     */
    public Workspace getWorkspaceById(Long workspaceId) {
        return workspaceRepo.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Work space not found"));
    }

    /**
     * Get workspace by slug
     */
    public Workspace getWorkspaceBySlug(String slug) {
        return workspaceRepo.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Work space not found"));
    }

    /**
     * Get all workspaces
     */
    public List<Workspace> getAllWorkspaces() {
        return workspaceRepo.findAll();
    }
}
