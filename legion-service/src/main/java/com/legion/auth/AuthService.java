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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for handling authentication operations.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

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

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        log.info("Registering new user email={}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed: email already exists={}", request.getEmail());
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());

        user = userRepository.save(user);

        log.info("User registered successfully id={} email={}", user.getId(), user.getEmail());

        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(token, UserDto.fromUser(user));
    }

    @Transactional
    public AuthResponse acceptInvitation(String token, String email, String password, String fullName) {

        log.info("Processing invitation acceptance email={} token={}", email, token);

        Invitation invitation = invitationService.getInvitationByToken(token);

        if (!invitation.getEmail().equalsIgnoreCase(email)) {
            log.warn(
                    "Invitation email mismatch: expected={} provided={}",
                    invitation.getEmail(),
                    email
            );
            throw new UnauthorizedException("This invitation is for " + invitation.getEmail());
        }

        User user;

        if (userRepository.existsByEmail(email)) {
            log.info("Existing user accepting invitation email={}", email);

            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new InvalidOperationException("User lookup failed"));

            if (workspaceMemberRepository.existsByUserIdAndWorkspaceId(
                    user.getId(),
                    invitation.getWorkspace().getId()
            )) {
                throw new DuplicateResourceException(
                        "User",
                        "email",
                        email + " is already in this workspace"
                );
            }
        } else {
            log.info("Creating new user from invitation email={}", email);

            user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setFullName(fullName);
            user = userRepository.save(user);
        }

        log.info(
                "Adding user={} to workspaceId={} with role={}",
                user.getEmail(),
                invitation.getWorkspace().getId(),
                invitation.getRole()
        );

        WorkspaceMember member =
                new WorkspaceMember(user, invitation.getWorkspace(), invitation.getRole());
        workspaceMemberRepository.save(member);

        invitationService.markInvitationAsUsed(invitation.getId());
        log.info("Invitation marked as used id={}", invitation.getId());

        String jwtToken = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(jwtToken, UserDto.fromUser(user));
    }

    public AuthResponse login(LoginRequest request) {

        log.info("Login attempt email={}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed: user not found email={}", request.getEmail());
                    return new InvalidOperationException("Invalid email or password");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed: invalid password email={}", request.getEmail());
            throw new InvalidOperationException("Invalid email or password");
        }

        log.info("Login successful email={}", user.getEmail());

        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(token, UserDto.fromUser(user));
    }
}
