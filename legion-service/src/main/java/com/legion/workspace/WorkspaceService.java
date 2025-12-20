package com.legion.workspace;

import com.legion.common.exception.DuplicateResourceException;
import com.legion.common.exception.ResourceNotFoundException;
import com.legion.user.Role;
import com.legion.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for workspace management.
 *
 * <p>When a workspace is created, the creator is automatically added as ADMIN.</p>
 */
@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository,
                            WorkspaceMemberRepository workspaceMemberRepository) {
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
    }

    /**
     * Creates a new workspace and adds the creator as ADMIN.
     *
     * @param name workspace name
     * @param slug unique slug for URLs
     * @param creator the user creating the workspace (becomes ADMIN)
     * @return created workspace
     */
    @Transactional
    public Workspace createWorkspace(String name, String slug, User creator) {
        if (workspaceRepository.existsBySlug(slug)) {
            throw new DuplicateResourceException("Workspace", "slug", slug);
        }

        Workspace workspace = new Workspace(name, slug);
        workspace = workspaceRepository.save(workspace);

        // Add creator as ADMIN
        WorkspaceMember member = new WorkspaceMember(creator, workspace, Role.ADMIN);
        workspaceMemberRepository.save(member);

        return workspace;
    }

    public Workspace getWorkspaceById(Long id) {
        return workspaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", id));
    }

    public Workspace getWorkspaceBySlug(String slug) {
        return workspaceRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", "slug", slug));
    }

    public List<Workspace> getAllWorkspaces() {
        return workspaceRepository.findAll();
    }

    /**
     * Get all workspaces a user is a member of.
     */
    public List<WorkspaceMember> getUserWorkspaces(Long userId) {
        return workspaceMemberRepository.findByUserId(userId);
    }

    /**
     * Get all members of a workspace.
     */
    public List<WorkspaceMember> getWorkspaceMembers(Long workspaceId) {
        return workspaceMemberRepository.findByWorkspaceId(workspaceId);
    }
}