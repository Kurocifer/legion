package com.legion.sprint;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {

    List<Sprint> findByProjectId(Long projectId);

    List<Sprint> findByProjectIdAndStatus(Long projectId, SprintStatus status);

    @Query("SELECT s FROM Sprint s WHERE s.project.id = :projectId AND s.status = 'ACTIVE'")
    Optional<Sprint> findActiveSprintByProjectId(@Param("projectId") Long projectId);
}