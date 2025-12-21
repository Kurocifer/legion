package com.legion.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByWorkspaceId(Long workspaceId);

    Optional<Project> findByWorkspaceIdAndKey(Long workspaceId, String key);

    boolean existsByWorkspaceIdAndKey(Long workspaceId, String key);
}