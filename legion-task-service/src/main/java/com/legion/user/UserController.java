package com.legion.user;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody CreateUserRequest request) {
        User user = userService.createUser(
                request.getEmail(),
                request.getPassword(),
                request.getFullName(),
                request.getWorkspaceId(),
                request.getRole()
        );
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<User>> getUsersByWorkspace(@PathVariable Long workspaceId) {
        List<User> users = userService.getUsersByWorkspace(workspaceId);
        return ResponseEntity.ok(users);
    }

    // DTO for request
    @Setter
    @Getter
    public static class CreateUserRequest {
        private String email;
        private String password;
        private String fullName;
        private Long workspaceId;
        private Role role;

    }
}