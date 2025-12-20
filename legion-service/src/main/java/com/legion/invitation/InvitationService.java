package com.legion.invitation;

import com.legion.common.exception.DuplicateResourceException;
import com.legion.common.exception.InvalidOperationException;
import com.legion.common.exception.ResourceNotFoundException;
import com.legion.common.exception.UnauthorizedException;
import com.legion.user.Role;
import com.legion.user.User;
import com.legion.workspace.Workspace;
import com.legion.workspace.WorkspaceMember;
import com.legion.workspace.WorkspaceMemberRepository;
import com.legion.workspace.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for managing workspace invitations.
 */
@Service
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public InvitationService(InvitationRepository invitationRepository,
                             WorkspaceRepository workspaceRepository,
                             WorkspaceMemberRepository workspaceMemberRepository) {
        this.invitationRepository = invitationRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
    }

    /**
     * Creates an invitation for a user to join a workspace.
     *
     * @param email email of user to invite
     * @param workspaceId workspace to invite to
     * @param role role to assign (DEVELOPER, MANAGER, ADMIN)
     * @param invitedBy user sending the invitation (must be ADMIN or MANAGER)
     * @return created invitation
     */
    @Transactional
    public Invitation createInvitation(String email, Long workspaceId, Role role, User invitedBy) {

        // Validate workspace exists
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", workspaceId));

        // Validate inviter is ADMIN or MANAGER in this workspace
        WorkspaceMember inviterMembership = workspaceMemberRepository
                .findByUserIdAndWorkspaceId(invitedBy.getId(), workspaceId)
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this workspace"));

        if (inviterMembership.getRole() != Role.ADMIN && inviterMembership.getRole() != Role.MANAGER) {
            throw new UnauthorizedException("Only ADMIN or MANAGER can invite users");
        }

        // Check if user is already in workspace
        if (workspaceMemberRepository.existsByWorkspaceIdAndUserEmail(workspaceId, email)) {
            throw new DuplicateResourceException("User", "email", email + " is already in this workspace");
        }

        // Check if pending invitation already exists
        if (invitationRepository.existsByEmailAndWorkspaceIdAndUsedFalse(email, workspaceId)) {
            throw new DuplicateResourceException("Invitation", "email", email + " already has a pending invitation");
        }

        // Create invitation
        Invitation invitation = new Invitation(email, workspace, role, invitedBy);
        return invitationRepository.save(invitation);
    }

    /**
     * Gets an invitation by token and validates it.
     *
     * @param token invitation token
     * @return invitation if valid
     */
    public Invitation getInvitationByToken(String token) {
        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation", "token", token));

        // Validate invitation
        if (invitation.isUsed()) {
            throw new InvalidOperationException("This invitation has already been used");
        }

        if (invitation.isExpired()) {
            throw new InvalidOperationException("This invitation has expired");
        }

        return invitation;
    }

    /**
     * Marks an invitation as used.
     */
    @Transactional
    public void markInvitationAsUsed(Long invitationId) {
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation", invitationId));

        invitation.setUsed(true);
        invitationRepository.save(invitation);
    }

    /**
     * Gets all invitations for a workspace.
     */
    public List<Invitation> getWorkspaceInvitations(Long workspaceId) {
        return invitationRepository.findByWorkspaceId(workspaceId);
    }
}