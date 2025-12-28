package com.legion.project;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.legion.workspace.Workspace;
import com.legion.task.Task;
import com.legion.sprint.Sprint;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Entity
@Table(name = "project",
        uniqueConstraints = @UniqueConstraint(columnNames = {"workspace_id", "key"}),
        indexes = {
                @Index(name = "idx_project_workspace", columnList = "workspace_id"),
                @Index(name = "idx_project_key", columnList = "key")
        })
public class Project {

    // Getters and Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 10)
    private String key;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Sprint> sprints = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public Project() {}

    public Project(String name, String key, String description) {
        this.name = name;
        this.key = key;
        this.description = description;
    }

}