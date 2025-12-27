package com.legion.invitation;

import com.legion.user.Role;
import com.legion.user.User;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * REST controller for invitation operations.
 */
@RestController
@RequestMapping("/api/invitations")
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    /**
     * Create an invitation (ADMIN or MANAGER only).
     */
    @PostMapping
    public ResponseEntity<InvitationResponse> createInvitation(
            @RequestBody CreateInvitationRequest request,
            @AuthenticationPrincipal User currentUser) {

        Invitation invitation = invitationService.createInvitation(
                request.getEmail(),
                request.getWorkspaceId(),
                request.getRole(),
                currentUser
        );

        InvitationResponse response = new InvitationResponse(
                invitation.getId(),
                invitation.getEmail(),
                invitation.getToken(),
                invitation.getRole(),
                invitation.getExpiresAt()
        );

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get invitation details by token
     */
    @GetMapping("/token/{token}")
    public ResponseEntity<InvitationDetailsResponse> getInvitationByToken(@PathVariable String token) {
        Invitation invitation = invitationService.getInvitationByToken(token);

        InvitationDetailsResponse response = new InvitationDetailsResponse(
                invitation.getEmail(),
                invitation.getWorkspace().getName(),
                invitation.getRole(),
                invitation.getExpiresAt()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Get all invitations for a workspace.
     */
    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<Invitation>> getWorkspaceInvitations(@PathVariable Long workspaceId) {
        List<Invitation> invitations = invitationService.getWorkspaceInvitations(workspaceId);
        return ResponseEntity.ok(invitations);
    }

    // DTOs
    @Setter
    @Getter
    public static class CreateInvitationRequest {
        private String email;
        private Long workspaceId;
        private Role role;

    }

    @Getter
    public static class InvitationResponse {
        private Long id;
        private String email;
        private String token;
        private Role role;
        private LocalDateTime expiresAt;

        public InvitationResponse(Long id, String email, String token, Role role, LocalDateTime expiresAt) {
            this.id = id;
            this.email = email;
            this.token = token;
            this.role = role;
            this.expiresAt = expiresAt;
        }

    }

    @Getter
    public static class InvitationDetailsResponse {
        private String email;
        private String workspaceName;
        private Role role;
        private LocalDateTime expiresAt;

        public InvitationDetailsResponse(String email, String workspaceName, Role role, LocalDateTime expiresAt) {
            this.email = email;
            this.workspaceName = workspaceName;
            this.role = role;
            this.expiresAt = expiresAt;
        }

    }
}