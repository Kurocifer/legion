package com.legion.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // Find tasks by project
    List<Task> findByProjectId(Long projectId);

    // Find tasks by sprint
    List<Task> findBySprintId(Long sprintId);

    // Find tasks by assignee
    List<Task> findByAssigneeId(Long assigneeId);

    // Find tasks by status
    List<Task> findByProjectIdAndStatus(Long projectId, TaskStatus status);

    // Find tasks in sprint by status
    List<Task> findBySprintIdAndStatus(Long sprintId, TaskStatus status);

    // Get max task number for auto-increment per project
    @Query("SELECT COALESCE(MAX(t.taskNumber), 0) FROM Task t WHERE t.project.id = :projectId")
    Integer findMaxTaskNumberByProjectId(@Param("projectId") Long projectId);

    // Get task by project and task number (for display like LEG-42)
    Optional<Task> findByProjectIdAndTaskNumber(Long projectId, Integer taskNumber);

    // Multi-tenancy security: Get all tasks in a workspace
    @Query("SELECT t FROM Task t WHERE t.project.workspace.id = :workspaceId")
    List<Task> findAllByWorkspaceId(@Param("workspaceId") Long workspaceId);
}