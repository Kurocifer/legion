package com.legion.auth;

import com.legion.auth.dto.AuthResponse;
import com.legion.auth.dto.LoginRequest;
import com.legion.auth.dto.RegisterRequest;
import com.legion.auth.dto.UserDto;
import com.legion.common.exception.DuplicateResourceException;
import com.legion.common.exception.InvalidOperationException;
import com.legion.common.exception.UnauthorizedException;
import com.legion.invitation.Invitation;
import com.legion.invitation.InvitationService;
import com.legion.user.User;
import com.legion.user.UserRepository;
import com.legion.workspace.WorkspaceMember;
import com.legion.workspace.WorkspaceMemberRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for handling authentication operations.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final InvitationService invitationService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       WorkspaceMemberRepository workspaceMemberRepository,
                       InvitationService invitationService,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.invitationService = invitationService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Registers a new user.
     * User must create or join a workspace after registration.
     *
     * @param request registration details
     * @return authentication response with JWT token
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        // Create user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());

        user = userRepository.save(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(token, UserDto.fromUser(user));
    }

    /**
     * Accepts an invitation and adds user to workspace.
     * If user doesn't exist, creates account first.
     *
     * @param token invitation token
     * @param email email (must match invitation)
     * @param password user's password
     * @param fullName user's full name
     * @return authentication response with JWT token
     */
    @Transactional
    public AuthResponse acceptInvitation(String token, String email, String password, String fullName) {

        // Validate invitation
        Invitation invitation = invitationService.getInvitationByToken(token);

        // Verify email matches
        if (!invitation.getEmail().equalsIgnoreCase(email)) {
            throw new UnauthorizedException("This invitation is for " + invitation.getEmail());
        }

        User user;

        // Check if user already exists
        if (userRepository.existsByEmail(email)) {
            // Existing user
            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new InvalidOperationException("User lookup failed"));

            // Check if already in workspace
            if (workspaceMemberRepository.existsByUserIdAndWorkspaceId(user.getId(), invitation.getWorkspace().getId())) {
                throw new DuplicateResourceException("User", "email", email + " is already in this workspace");
            }
        } else {
            // New user - create account
            user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setFullName(fullName);
            user = userRepository.save(user);
        }

        // Add user to workspace with invited role
        WorkspaceMember member = new WorkspaceMember(user, invitation.getWorkspace(), invitation.getRole());
        workspaceMemberRepository.save(member);

        // Mark invitation as used
        invitationService.markInvitationAsUsed(invitation.getId());

        // Generate JWT token
        String jwtToken = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(jwtToken, UserDto.fromUser(user));
    }

    /**
     * Authenticates a user and generates a JWT token.
     *
     * @param request login credentials
     * @return authentication response with JWT token
     */
    public AuthResponse login(LoginRequest request) {

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidOperationException("Invalid email or password"));

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidOperationException("Invalid email or password");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(token, UserDto.fromUser(user));
    }
}