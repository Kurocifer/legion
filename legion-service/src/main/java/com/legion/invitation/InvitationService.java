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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for managing workspace invitations.
 */
@Service
public class InvitationService {

    private static final Logger log = LoggerFactory.getLogger(InvitationService.class);

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

    @Transactional
    public Invitation createInvitation(String email, Long workspaceId, Role role, User invitedBy) {

        log.info(
                "Creating invitation email={} workspaceId={} role={} invitedBy={}",
                email,
                workspaceId,
                role,
                invitedBy.getEmail()
        );

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", workspaceId));

        WorkspaceMember inviterMembership = workspaceMemberRepository
                .findByUserIdAndWorkspaceId(invitedBy.getId(), workspaceId)
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this workspace"));

        if (inviterMembership.getRole() != Role.ADMIN && inviterMembership.getRole() != Role.MANAGER) {
            log.warn(
                    "Unauthorized invitation attempt by user={} role={} workspaceId={}",
                    invitedBy.getEmail(),
                    inviterMembership.getRole(),
                    workspaceId
            );
            throw new UnauthorizedException("Only ADMIN or MANAGER can invite users");
        }

        if (workspaceMemberRepository.existsByWorkspaceIdAndUserEmail(workspaceId, email)) {
            log.warn(
                    "Invitation failed: user already in workspace email={} workspaceId={}",
                    email,
                    workspaceId
            );
            throw new DuplicateResourceException("User", "email", email + " is already in this workspace");
        }

        if (invitationRepository.existsByEmailAndWorkspaceIdAndUsedFalse(email, workspaceId)) {
            log.warn(
                    "Invitation failed: pending invitation already exists email={} workspaceId={}",
                    email,
                    workspaceId
            );
            throw new DuplicateResourceException("Invitation", "email", email + " already has a pending invitation");
        }

        Invitation invitation = new Invitation(email, workspace, role, invitedBy);
        Invitation saved = invitationRepository.save(invitation);

        log.info(
                "Invitation created id={} email={} workspaceId={}",
                saved.getId(),
                email,
                workspaceId
        );

        return saved;
    }

    public Invitation getInvitationByToken(String token) {

        log.debug("Validating invitation token={}", token);

        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation", "token", token));

        if (invitation.isUsed()) {
            log.warn("Invitation already used id={}", invitation.getId());
            throw new InvalidOperationException("This invitation has already been used");
        }

        if (invitation.isExpired()) {
            log.warn("Invitation expired id={}", invitation.getId());
            throw new InvalidOperationException("This invitation has expired");
        }

        return invitation;
    }

    @Transactional
    public void markInvitationAsUsed(Long invitationId) {

        log.info("Marking invitation as used id={}", invitationId);

        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation", invitationId));

        invitation.setUsed(true);
        invitationRepository.save(invitation);
    }

    public List<Invitation> getWorkspaceInvitations(Long workspaceId) {

        log.debug("Fetching invitations for workspaceId={}", workspaceId);

        return invitationRepository.findByWorkspaceId(workspaceId);
    }
}
