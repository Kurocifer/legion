package com.legion.auth;

import com.legion.auth.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Register a new user.
     * User creates/joins workspace after registration.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Accept an invitation to join a workspace.
     */
    @PostMapping("/accept-invitation")
    public ResponseEntity<AuthResponse> acceptInvitation(@RequestBody AcceptInvitationRequest request) {
        AuthResponse response = authService.acceptInvitation(
                request.getToken(),
                request.getEmail(),
                request.getPassword(),
                request.getFullName()
        );
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Login with email and password.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}