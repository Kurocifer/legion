package com.legion.sprint;

import com.legion.project.Project;
import com.legion.project.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class SprintService {

    private final SprintRepository sprintRepo;
    private final ProjectRepository projectRepo;

    public SprintService(SprintRepository sprintRepo,
                         ProjectRepository projectRepo) {
        this.sprintRepo = sprintRepo;
        this.projectRepo = projectRepo;
    }

    @Transactional
    public Sprint createSprint(Long projectId, String name,
                               LocalDate startDate, LocalDate endDate) {

        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Sprint sprint = new Sprint(name, startDate, endDate, SprintStatus.PLANNING);
        sprint.setProject(project);

        return sprintRepo.save(sprint);
    }

    public Sprint getSprintById(Long id) {
        return sprintRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Sprint not found"));
    }

    public List<Sprint> getSprintsByProject(Long projectId) {
        return sprintRepo.findByProjectId(projectId);
    }

    @Transactional
    public Sprint updateSprintStatus(Long sprintId, SprintStatus newStatus) {
        Sprint sprint = sprintRepo.findById(sprintId)
                .orElseThrow(() -> new RuntimeException("Sprint not found"));

        sprint.setStatus(newStatus);
        return sprintRepo.save(sprint);
    }
}