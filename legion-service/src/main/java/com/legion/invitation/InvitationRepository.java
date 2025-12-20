package com.legion.invitation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    Optional<Invitation> findByToken(String token);

    List<Invitation> findByWorkspaceId(Long workspaceId);

    List<Invitation> findByEmail(String email);

    boolean existsByEmailAndWorkspaceIdAndUsedFalse(String email, Long workspaceId);
}