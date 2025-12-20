package com.legion.workspace;

import com.legion.user.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long> {

    // Check if user is in workspace
    boolean existsByUserIdAndWorkspaceId(Long userId, Long workspaceId);

    // Check if user email is in workspace
    @Query("SELECT CASE WHEN COUNT(wm) > 0 THEN true ELSE false END " +
            "FROM WorkspaceMember wm WHERE wm.workspace.id = :workspaceId " +
            "AND wm.user.email = :email")
    boolean existsByWorkspaceIdAndUserEmail(@Param("workspaceId") Long workspaceId,
                                            @Param("email") String email);

    // Get user's membership in workspace
    Optional<WorkspaceMember> findByUserIdAndWorkspaceId(Long userId, Long workspaceId);

    // Get all members of a workspace
    List<WorkspaceMember> findByWorkspaceId(Long workspaceId);

    // Get all workspaces a user is in
    List<WorkspaceMember> findByUserId(Long userId);

    // Get all admins of a workspace
    List<WorkspaceMember> findByWorkspaceIdAndRole(Long workspaceId, Role role);

    // Get user's role in workspace
    @Query("SELECT wm.role FROM WorkspaceMember wm " +
            "WHERE wm.user.id = :userId AND wm.workspace.id = :workspaceId")
    Optional<Role> findRoleByUserIdAndWorkspaceId(@Param("userId") Long userId,
                                                  @Param("workspaceId") Long workspaceId);
}