package com.legion.workspace;

import org.springframework.stereotype.Service;

import com.legion.common.exception.DuplicateResourceException;
import com.legion.common.exception.ResourceNotFoundException;
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
            throw new DuplicateResourceException("Workspac", "slug", slug);
        }

        Workspace workspace = new Workspace(name, slug);
        return workspaceRepo.save(workspace);
    }

    /**
     * Get workspace by Id
     */
    public Workspace getWorkspaceById(Long workspaceId) {
        return workspaceRepo.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", workspaceId));
    }

    /**
     * Get workspace by slug
     */
    public Workspace getWorkspaceBySlug(String slug) {
        return workspaceRepo.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", "slug", slug));
    }

    /**
     * Get all workspaces
     */
    public List<Workspace> getAllWorkspaces() {
        return workspaceRepo.findAll();
    }
}
