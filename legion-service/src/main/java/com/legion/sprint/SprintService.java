package com.legion.sprint;

import com.legion.common.context.WorkspaceContextHelper;
import com.legion.common.exception.InvalidOperationException;
import com.legion.common.exception.ResourceNotFoundException;
import com.legion.project.Project;
import com.legion.project.ProjectRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class SprintService {

    private static final Logger log = LoggerFactory.getLogger(SprintService.class);

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;

    public SprintService(SprintRepository sprintRepository,
                         ProjectRepository projectRepository) {
        this.sprintRepository = sprintRepository;
        this.projectRepository = projectRepository;
    }

    @Transactional
    public Sprint createSprint(Long projectId, String name,
                               LocalDate startDate, LocalDate endDate) {

        log.info("Creating sprint: projectId={}, name={}", projectId, name);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        WorkspaceContextHelper.validateWorkspace(project.getWorkspace().getId());

        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            log.warn("Invalid sprint dates: startDate={}, endDate={}", startDate, endDate);
            throw new InvalidOperationException("Start date must be before end date");
        }

        Sprint sprint = new Sprint(name, startDate, endDate, SprintStatus.PLANNING);
        sprint.setProject(project);

        Sprint saved = sprintRepository.save(sprint);
        log.info("Sprint saved with id={}", saved.getId());

        return saved;
    }

    public Sprint getSprintById(Long id) {
        log.debug("Getting sprint by id={}", id);

        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", id));

        WorkspaceContextHelper.validateWorkspace(sprint.getProject().getWorkspace().getId());
        return sprint;
    }

    public List<Sprint> getSprintsByProject(Long projectId) {
        log.debug("Getting sprints for projectId={}", projectId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        WorkspaceContextHelper.validateWorkspace(project.getWorkspace().getId());
        return sprintRepository.findByProjectId(projectId);
    }

    @Transactional
    public Sprint updateSprintStatus(Long sprintId, SprintStatus newStatus) {
        log.info("Updating sprint status: sprintId={}, newStatus={}", sprintId, newStatus);

        Sprint sprint = getSprintById(sprintId);

        if (sprint.getStatus() == SprintStatus.COMPLETED && newStatus != SprintStatus.COMPLETED) {
            log.warn("Attempt to reopen completed sprint: sprintId={}", sprintId);
            throw new InvalidOperationException("Cannot reopen a completed sprint");
        }

        sprint.setStatus(newStatus);
        return sprintRepository.save(sprint);
    }

    @Transactional
    public void deleteSprint(Long sprintId) {
        log.info("Deleting sprint id={}", sprintId);

        Sprint sprint = getSprintById(sprintId);

        if (!sprint.getTasks().isEmpty()) {
            log.warn("Cannot delete sprint with tasks: sprintId={}", sprintId);
            throw new InvalidOperationException(
                    "Cannot delete sprint with tasks. Move or delete tasks first.");
        }

        sprintRepository.delete(sprint);
    }
}
