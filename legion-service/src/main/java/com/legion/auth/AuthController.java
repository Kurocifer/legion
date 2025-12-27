package com.legion.auth;

import com.legion.auth.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

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
        log.info("Auth register attempt for email={}", request.getEmail());

        AuthResponse response = authService.register(request);

        log.info("Auth register successful for email={}", request.getEmail());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Accept an invitation to join a workspace.
     */
    @PostMapping("/accept-invitation")
    public ResponseEntity<AuthResponse> acceptInvitation(@RequestBody AcceptInvitationRequest request) {
        log.info(
                "Auth invitation acceptance attempt for email={}, invitationToken={}",
                request.getEmail(),
                request.getToken()
        );

        AuthResponse response = authService.acceptInvitation(
                request.getToken(),
                request.getEmail(),
                request.getPassword(),
                request.getFullName()
        );

        log.info("Auth invitation accepted successfully for email={}", request.getEmail());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Login with email and password.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        log.info("Auth login attempt for email={}", request.getEmail());

        AuthResponse response = authService.login(request);

        log.info("Auth login successful for email={}", request.getEmail());
        return ResponseEntity.ok(response);
    }
}
