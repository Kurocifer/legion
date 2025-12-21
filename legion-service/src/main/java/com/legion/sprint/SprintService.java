package com.legion.sprint;

import com.legion.common.context.WorkspaceContextHelper;
import com.legion.common.exception.InvalidOperationException;
import com.legion.common.exception.ResourceNotFoundException;
import com.legion.project.Project;
import com.legion.project.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;

    public SprintService(SprintRepository sprintRepository,
                         ProjectRepository projectRepository) {
        this.sprintRepository = sprintRepository;
        this.projectRepository = projectRepository;
    }

    /**
     * Creates a new sprint in a project with workspace validation.
     */
    @Transactional
    public Sprint createSprint(Long projectId, String name,
                               LocalDate startDate, LocalDate endDate) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        // Validate project belongs to current workspace
        WorkspaceContextHelper.validateWorkspace(project.getWorkspace().getId());

        // Validate dates
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new InvalidOperationException("Start date must be before end date");
        }

        Sprint sprint = new Sprint(name, startDate, endDate, SprintStatus.PLANNING);
        sprint.setProject(project);

        return sprintRepository.save(sprint);
    }

    /**
     * Gets a sprint by ID with workspace validation.
     */
    public Sprint getSprintById(Long id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", id));

        // Validate sprint's project belongs to current workspace
        WorkspaceContextHelper.validateWorkspace(sprint.getProject().getWorkspace().getId());

        return sprint;
    }

    /**
     * Gets all sprints for a project with workspace validation.
     */
    public List<Sprint> getSprintsByProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        // Validate project belongs to current workspace
        WorkspaceContextHelper.validateWorkspace(project.getWorkspace().getId());

        return sprintRepository.findByProjectId(projectId);
    }

    /**
     * Gets active sprint for a project with workspace validation.
     */
    public Sprint getActiveSprintByProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        // Validate project belongs to current workspace
        WorkspaceContextHelper.validateWorkspace(project.getWorkspace().getId());

        return sprintRepository.findActiveSprintByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Active Sprint", "projectId", projectId));
    }

    /**
     * Updates sprint status with workspace validation.
     */
    @Transactional
    public Sprint updateSprintStatus(Long sprintId, SprintStatus newStatus) {
        Sprint sprint = getSprintById(sprintId);

        // Validate status transition
        if (sprint.getStatus() == SprintStatus.COMPLETED && newStatus != SprintStatus.COMPLETED) {
            throw new InvalidOperationException("Cannot reopen a completed sprint");
        }

        sprint.setStatus(newStatus);
        return sprintRepository.save(sprint);
    }

    /**
     * Updates sprint details with workspace validation.
     */
    @Transactional
    public Sprint updateSprint(Long sprintId, String name, LocalDate startDate, LocalDate endDate) {
        Sprint sprint = getSprintById(sprintId);

        if (name != null) {
            sprint.setName(name);
        }
        if (startDate != null) {
            sprint.setStartDate(startDate);
        }
        if (endDate != null) {
            sprint.setEndDate(endDate);
        }

        // Validate dates
        if (sprint.getStartDate() != null && sprint.getEndDate() != null
                && sprint.getStartDate().isAfter(sprint.getEndDate())) {
            throw new InvalidOperationException("Start date must be before end date");
        }

        return sprintRepository.save(sprint);
    }

    /**
     * Deletes a sprint with workspace validation.
     * Tasks in the sprint will be unassigned (sprint_id set to null).
     */
    @Transactional
    public void deleteSprint(Long sprintId) {
        Sprint sprint = getSprintById(sprintId);

        if (!sprint.getTasks().isEmpty()) {
            throw new InvalidOperationException(
                    "Cannot delete sprint with tasks. Move or delete tasks first.");
        }

        sprintRepository.delete(sprint);
    }
}