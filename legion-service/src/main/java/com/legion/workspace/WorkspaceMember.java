package com.legion.workspace;

import com.legion.user.User;
import com.legion.user.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * WorkspaceMember represents a user's membership in a workspace.
 *
 * <p>This is the join table that allows users to belong to multiple workspaces
 * with different roles in each workspace.</p>
 *
 */
@Setter
@Getter
@Entity
@Table(name = "workspace_member",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "workspace_id"}),
        indexes = {
                @Index(name = "idx_member_workspace", columnList = "workspace_id"),
                @Index(name = "idx_member_user", columnList = "user_id"),
                @Index(name = "idx_member_role", columnList = "role")
        })
public class WorkspaceMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }

    // Constructors
    public WorkspaceMember() {}

    public WorkspaceMember(User user, Workspace workspace, Role role) {
        this.user = user;
        this.workspace = workspace;
        this.role = role;
    }

}