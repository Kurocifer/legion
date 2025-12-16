package com.legion.user;

import org.springframework.stereotype.Service;
import com.legion.common.exception.DuplicateResourceException;
import com.legion.common.exception.ResourceNotFoundException;
import com.legion.workspace.Workspace;
import com.legion.workspace.WorkspaceRepository;
import jakarta.transaction.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepo;
    private final WorkspaceRepository workspaceRepo;

    public UserService(UserRepository userRepo, WorkspaceRepository workspaceRepo) {
        this.userRepo = userRepo;
        this.workspaceRepo = workspaceRepo;
    }

    /**
     * Create new User
     */
    @Transactional
    public User createUser(String email, String password, String fullName, Long workSpaceId, Role role) {

        if (userRepo.existsByEmail(email)) {
            throw new DuplicateResourceException("User", "email", email);
        }

        // Ensure workspace exists
        Workspace workspace = workspaceRepo.findById(workSpaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", workSpaceId));

        User user = new User(email, password, fullName, role);
        user.setWorkspace(workspace);

        return userRepo.save(user);
    }

    /**
     * Find user by Id
     */
    public User getUserById(Long userId) {
        return userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }

    /**
     * Find user by Email
     */
    public User getUserByEmail(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    /**
     * Find Users by workspace
     */
    public List<User> getUsersByWorkspace(Long workspaceId) {
        return userRepo.findByWorkspaceId(workspaceId);
    }
}
