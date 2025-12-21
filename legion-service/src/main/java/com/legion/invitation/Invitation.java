package com.legion.invitation;

import com.legion.user.Role;
import com.legion.user.User;
import com.legion.workspace.Workspace;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Invitation for a user to join a workspace.
 *
 * <p>Invitations are sent by workspace admins to invite new members.
 * Each invitation has a unique token and expires after 7 days.</p>
 */

@Setter
@Getter
@Entity
@Table(name = "invitation", indexes = {
        @Index(name = "idx_invitation_token", columnList = "token"),
        @Index(name = "idx_invitation_email", columnList = "email"),
        @Index(name = "idx_invitation_workspace", columnList = "workspace_id")
})
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(nullable = false, unique = true, length = 36)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by_id", nullable = false)
    private User invitedBy;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean used = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (token == null) {
            token = UUID.randomUUID().toString();
        }
        createdAt = LocalDateTime.now();
        if (expiresAt == null) {
            expiresAt = LocalDateTime.now().plusDays(7); // 7 day expiry
        }
    }

    // Constructors
    public Invitation() {}

    public Invitation(String email, Workspace workspace, Role role, User invitedBy) {
        this.email = email;
        this.workspace = workspace;
        this.role = role;
        this.invitedBy = invitedBy;
    }

    /**
     * Checks if invitation is expired.
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}