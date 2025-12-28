package com.legion.common.context;

/**
 * Thread-local storage for current workspace context.
 *
 * <p>Stores the workspace ID for the current request thread.
 * This allows services to access the current workspace without
 * passing it as a parameter everywhere.</p>
 */
public final class WorkspaceContext {

    private static final ThreadLocal<Long> CURRENT_WORKSPACE_ID = new ThreadLocal<>();

    private WorkspaceContext() {
    }

    /**
     * Sets the current workspace ID for this thread/request.
     */
    public static void setWorkspaceId(Long workspaceId) {
        CURRENT_WORKSPACE_ID.set(workspaceId);
    }

    /**
     * Gets the current workspace ID for this thread/request.
     *
     * @return workspace ID or null if not set
     */
    public static Long getWorkspaceId() {
        return CURRENT_WORKSPACE_ID.get();
    }

    /**
     * Checks if workspace context is set.
     */
    public static boolean hasWorkspace() {
        return CURRENT_WORKSPACE_ID.get() != null;
    }

    /**
     * Clears the workspace context.
     * MUST be called after each request to prevent memory leaks.
     */
    public static void clear() {
        CURRENT_WORKSPACE_ID.remove();
    }
}