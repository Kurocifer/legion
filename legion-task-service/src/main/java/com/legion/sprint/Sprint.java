package com.legion.sprint;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.legion.project.Project;
import com.legion.task.Task;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Entity
@Table(name = "sprint", indexes = {
        @Index(name = "idx_sprint_project", columnList = "project_id"),
        @Index(name = "idx_sprint_status", columnList = "status")
})
public class Sprint {

    // Getters and Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SprintStatus status;

    @JsonIgnore
    @OneToMany(mappedBy = "sprint")
    private List<Task> tasks = new ArrayList<>();

    // Constructors
    public Sprint() {}

    public Sprint(String name, LocalDate startDate, LocalDate endDate, SprintStatus status) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }

}