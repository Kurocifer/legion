package com.legion.workspace;

import com.legion.common.context.WorkspaceContextHelper;
import com.legion.common.exception.DuplicateResourceException;
import com.legion.common.exception.InvalidOperationException;
import com.legion.common.exception.ResourceNotFoundException;
import com.legion.user.Role;
import com.legion.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

    /**
     * Gets workspace by ID
     */
    public Workspace getWorkspaceById(Long id) {
        return workspaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", id));
    }

    /**
     * Gets workspace by slug.
     */
    public Workspace getWorkspaceBySlug(String slug) {
        return workspaceRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", "slug", slug));
    }

    /**
     * Gets all workspaces.
     */
    public List<Workspace> getAllWorkspaces() {
        return workspaceRepository.findAll();
    }

    /**
     * Gets all workspaces a user is a member of.
     */
    public List<WorkspaceMember> getUserWorkspaces(Long userId) {
        return workspaceMemberRepository.findByUserId(userId);
    }

    /**
     * Gets all members of a workspace with validation.
     */
    public List<WorkspaceMember> getWorkspaceMembers(Long workspaceId) {
        WorkspaceContextHelper.validateWorkspace(workspaceId);

        return workspaceMemberRepository.findByWorkspaceId(workspaceId);
    }

    /**
     * Removes a member from workspace with validation.
     */
    @Transactional
    public void removeMember(Long workspaceId, Long userId) {
        WorkspaceContextHelper.validateWorkspace(workspaceId);

        // Check if trying to remove last admin
        List<WorkspaceMember> admins = workspaceMemberRepository
                .findByWorkspaceIdAndRole(workspaceId, Role.ADMIN);

        if (admins.size() == 1 && admins.getFirst().getUser().getId().equals(userId)) {
            throw new InvalidOperationException(
                    "Cannot remove last admin. Assign another admin first.");
        }

        WorkspaceMember member = workspaceMemberRepository
                .findByUserIdAndWorkspaceId(userId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkspaceMember",
                        "userId", userId + " in workspace " + workspaceId));

        workspaceMemberRepository.delete(member);
    }

    /**
     * Updates a member's role with validation.
     */
    @Transactional
    public WorkspaceMember updateMemberRole(Long workspaceId, Long userId, Role newRole) {
        WorkspaceContextHelper.validateWorkspace(workspaceId);

        // Check if trying to demote last admin
        if (newRole != Role.ADMIN) {
            List<WorkspaceMember> admins = workspaceMemberRepository
                    .findByWorkspaceIdAndRole(workspaceId, Role.ADMIN);

            if (admins.size() == 1 && admins.getFirst().getUser().getId().equals(userId)) {
                throw new InvalidOperationException(
                        "Cannot demote last admin. Promote another admin first.");
            }
        }

        WorkspaceMember member = workspaceMemberRepository
                .findByUserIdAndWorkspaceId(userId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkspaceMember",
                        "userId", userId + " in workspace " + workspaceId));

        member.setRole(newRole);
        return workspaceMemberRepository.save(member);
    }
}