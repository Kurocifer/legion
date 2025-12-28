package com.legion.workspace;

import com.legion.common.context.WorkspaceContextHelper;
import com.legion.common.exception.DuplicateResourceException;
import com.legion.common.exception.InvalidOperationException;
import com.legion.common.exception.ResourceNotFoundException;
import com.legion.user.Role;
import com.legion.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WorkspaceService {

    private static final Logger log = LoggerFactory.getLogger(WorkspaceService.class);

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
        log.info("Creating workspace with slug={} by userId={}", slug, creator.getId());

        if (workspaceRepository.existsBySlug(slug)) {
            log.warn("Workspace creation failed: slug already exists [{}]", slug);
            throw new DuplicateResourceException("Workspace", "slug", slug);
        }

        Workspace workspace = new Workspace(name, slug);
        workspace = workspaceRepository.save(workspace);

        WorkspaceMember member = new WorkspaceMember(creator, workspace, Role.ADMIN);
        workspaceMemberRepository.save(member);

        log.info("Workspace created with id={} and ADMIN userId={}", workspace.getId(), creator.getId());
        return workspace;
    }

    /**
     * Gets workspace by ID
     */
    public Workspace getWorkspaceById(Long id) {
        log.debug("Fetching workspace by id={}", id);

        return workspaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", id));
    }

    /**
     * Gets workspace by slug.
     */
    public Workspace getWorkspaceBySlug(String slug) {
        log.debug("Fetching workspace by slug={}", slug);

        return workspaceRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", "slug", slug));
    }

    /**
     * Gets all workspaces.
     */
    public List<Workspace> getAllWorkspaces() {
        log.debug("Fetching all workspaces");
        return workspaceRepository.findAll();
    }

    /**
     * Gets all workspaces a user is a member of.
     */
    public List<WorkspaceMember> getUserWorkspaces(Long userId) {
        log.debug("Fetching workspaces for userId={}", userId);
        return workspaceMemberRepository.findByUserId(userId);
    }

    /**
     * Gets all members of a workspace with validation.
     */
    public List<WorkspaceMember> getWorkspaceMembers(Long workspaceId) {
        log.debug("Fetching members for workspaceId={}", workspaceId);

        WorkspaceContextHelper.validateWorkspace(workspaceId);
        return workspaceMemberRepository.findByWorkspaceId(workspaceId);
    }

    /**
     * Removes a member from workspace with validation.
     */
    @Transactional
    public void removeMember(Long workspaceId, Long userId) {
        log.info("Removing userId={} from workspaceId={}", userId, workspaceId);

        WorkspaceContextHelper.validateWorkspace(workspaceId);

        List<WorkspaceMember> admins = workspaceMemberRepository
                .findByWorkspaceIdAndRole(workspaceId, Role.ADMIN);

        if (admins.size() == 1 && admins.getFirst().getUser().getId().equals(userId)) {
            log.warn("Attempt to remove last ADMIN userId={} from workspaceId={}", userId, workspaceId);
            throw new InvalidOperationException(
                    "Cannot remove last admin. Assign another admin first.");
        }

        WorkspaceMember member = workspaceMemberRepository
                .findByUserIdAndWorkspaceId(userId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkspaceMember",
                        "userId", userId + " in workspace " + workspaceId));

        workspaceMemberRepository.delete(member);
        log.info("UserId={} removed from workspaceId={}", userId, workspaceId);
    }

    /**
     * Updates a member's role with validation.
     */
    @Transactional
    public WorkspaceMember updateMemberRole(Long workspaceId, Long userId, Role newRole) {
        log.info("Updating role for userId={} in workspaceId={} to {}", userId, workspaceId, newRole);

        WorkspaceContextHelper.validateWorkspace(workspaceId);

        if (newRole != Role.ADMIN) {
            List<WorkspaceMember> admins = workspaceMemberRepository
                    .findByWorkspaceIdAndRole(workspaceId, Role.ADMIN);

            if (admins.size() == 1 && admins.getFirst().getUser().getId().equals(userId)) {
                log.warn("Attempt to demote last ADMIN userId={} in workspaceId={}", userId, workspaceId);
                throw new InvalidOperationException(
                        "Cannot demote last admin. Promote another admin first.");
            }
        }

        WorkspaceMember member = workspaceMemberRepository
                .findByUserIdAndWorkspaceId(userId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkspaceMember",
                        "userId", userId + " in workspace " + workspaceId));

        member.setRole(newRole);
        WorkspaceMember saved = workspaceMemberRepository.save(member);

        log.info("Role updated for userId={} in workspaceId={}", userId, workspaceId);
        return saved;
    }
}
