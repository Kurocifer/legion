package com.legion.user;

import org.springframework.stereotype.Service;
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
            throw new RuntimeException("User with email '" + email + "' already exists");
        }

        // Ensure workspace exists
        Workspace workspace = workspaceRepo.findById(workSpaceId)
                .orElseThrow(() -> new RuntimeException("Work space doesn't exists"));

        User user = new User(email, password, fullName, role);
        user.setWorkspace(workspace);

        return userRepo.save(user);
    }

    /**
     * Find user by Id
     */
    public User getUserById(Long userId) {
        return userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Find user by Email
     */
    public User getUserByEmail(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Find Users by workspace
     */
    public List<User> getUsersByWorkspace(Long workspaceId) {
        return userRepo.findByWorkspaceId(workspaceId);
    }
}
