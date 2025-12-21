package com.legion.common.context;

import com.legion.common.exception.UnauthorizedException;

/**
 * Helper methods for workspace context validation.
 */
public final class WorkspaceContextHelper {

    private WorkspaceContextHelper() {
    }

    /**
     * Gets current workspace ID or throws exception if not set.
     *
     * @return current workspace ID
     * @throws UnauthorizedException if no workspace context
     */
    public static Long requireWorkspaceId() {
        Long workspaceId = WorkspaceContext.getWorkspaceId();
        if (workspaceId == null) {
            throw new UnauthorizedException("Workspace context required. Include X-Workspace-Id header.");
        }
        return workspaceId;
    }

    /**
     * Validates that a resource belongs to the current workspace.
     *
     * @param resourceWorkspaceId workspace ID of the resource
     * @throws UnauthorizedException if resource not in current workspace
     */
    public static void validateWorkspace(Long resourceWorkspaceId) {
        Long currentWorkspaceId = requireWorkspaceId();
        if (!currentWorkspaceId.equals(resourceWorkspaceId)) {
            throw new UnauthorizedException("Resource does not belong to current workspace");
        }
    }
}