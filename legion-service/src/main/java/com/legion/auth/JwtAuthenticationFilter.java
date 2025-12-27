package com.legion.auth;

import com.legion.common.context.WorkspaceContext;
import com.legion.user.Role;
import com.legion.user.User;
import com.legion.user.UserRepository;
import com.legion.workspace.WorkspaceMemberRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

/**
 * JWT Authentication Filter.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil,
                                   UserRepository userRepository,
                                   WorkspaceMemberRepository workspaceMemberRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        try {
            String authHeader = request.getHeader("Authorization");
            String workspaceIdHeader = request.getHeader("X-Workspace-Id");

            String token = extractToken(authHeader);

            if (token == null) {
                log.debug("No JWT token found for request {}", request.getRequestURI());
                filterChain.doFilter(request, response);
                return;
            }

            String username = jwtUtil.extractUsername(token);

            if (username == null) {
                log.warn("JWT token does not contain a username");
                filterChain.doFilter(request, response);
                return;
            }

            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                log.debug("Security context already populated for user={}", username);
                filterChain.doFilter(request, response);
                return;
            }

            User user = userRepository.findByEmail(username).orElse(null);

            if (user == null) {
                log.warn("JWT authentication failed: user not found for email={}", username);
                filterChain.doFilter(request, response);
                return;
            }

            if (!jwtUtil.validateToken(token, username)) {
                log.warn("Invalid JWT token for email={}", username);
                filterChain.doFilter(request, response);
                return;
            }

            authenticateUser(user, workspaceIdHeader);

            filterChain.doFilter(request, response);

        } finally {
            WorkspaceContext.clear();
        }
    }

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private void authenticateUser(User user, String workspaceIdHeader) {
        if (workspaceIdHeader == null || workspaceIdHeader.isEmpty()) {
            log.debug(
                    "No workspace header provided, authenticating user={} without workspace",
                    user.getEmail()
            );
            authenticateWithoutRole(user);
            return;
        }

        try {
            Long workspaceId = Long.parseLong(workspaceIdHeader);
            authenticateWithWorkspace(user, workspaceId);
        } catch (NumberFormatException e) {
            log.warn("Invalid workspace id header value={}", workspaceIdHeader);
            authenticateWithoutRole(user);
        }
    }

    private void authenticateWithWorkspace(User user, Long workspaceId) {
        Optional<Role> roleOpt = workspaceMemberRepository
                .findRoleByUserIdAndWorkspaceId(user.getId(), workspaceId);

        if (roleOpt.isPresent()) {
            WorkspaceContext.setWorkspaceId(workspaceId);

            log.info(
                    "Authenticated user={} in workspaceId={} with role={}",
                    user.getEmail(),
                    workspaceId,
                    roleOpt.get()
            );

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            Collections.singletonList(
                                    new SimpleGrantedAuthority("ROLE_" + roleOpt.get().name())
                            )
                    );

            SecurityContextHolder.getContext().setAuthentication(authToken);
        } else {
            log.warn(
                    "User={} does not belong to workspaceId={}, authenticating without role",
                    user.getEmail(),
                    workspaceId
            );
            authenticateWithoutRole(user);
        }
    }

    private void authenticateWithoutRole(User user) {
        log.debug("Authenticated user={} without workspace context", user.getEmail());

        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        Collections.emptyList()
                );

        SecurityContextHolder.getContext().setAuthentication(authToken);
    }
}
