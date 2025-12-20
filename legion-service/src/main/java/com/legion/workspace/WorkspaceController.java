package com.legion.workspace;

import com.legion.user.User;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for workspace operations.
 */
@RestController
@RequestMapping("/legion/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    /**
     * Create a new workspace.
     * The creator becomes ADMIN of the workspace.
     */
    @PostMapping
    public ResponseEntity<Workspace> createWorkspace(
            @RequestBody CreateWorkspaceRequest request,
            @AuthenticationPrincipal User currentUser) {

        Workspace workspace = workspaceService.createWorkspace(
                request.getName(),
                request.getSlug(),
                currentUser
        );
        return new ResponseEntity<>(workspace, HttpStatus.CREATED);
    }

    /**
     * Get workspace by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Workspace> getWorkspaceById(@PathVariable Long id) {
        Workspace workspace = workspaceService.getWorkspaceById(id);
        return ResponseEntity.ok(workspace);
    }

    /**
     * Get workspace by slug.
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<Workspace> getWorkspaceBySlug(@PathVariable String slug) {
        Workspace workspace = workspaceService.getWorkspaceBySlug(slug);
        return ResponseEntity.ok(workspace);
    }

    /**
     * Get all workspaces the current user is a member of.
     */
    @GetMapping("/my-workspaces")
    public ResponseEntity<List<WorkspaceMember>> getMyWorkspaces(
            @AuthenticationPrincipal User currentUser) {
        List<WorkspaceMember> workspaces = workspaceService.getUserWorkspaces(currentUser.getId());
        return ResponseEntity.ok(workspaces);
    }

    /**
     * Get all members of a workspace.
     */
    @GetMapping("/{workspaceId}/members")
    public ResponseEntity<List<WorkspaceMember>> getWorkspaceMembers(@PathVariable Long workspaceId) {
        List<WorkspaceMember> members = workspaceService.getWorkspaceMembers(workspaceId);
        return ResponseEntity.ok(members);
    }

    // DTO
    @Setter
    @Getter
    public static class CreateWorkspaceRequest {
        private String name;
        private String slug;

    }
}