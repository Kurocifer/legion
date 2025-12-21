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
 *
 * <p>Extracts and validates:</p>
 * <ul>
 *   <li>JWT token from Authorization header</li>
 *   <li>Workspace ID from X-Workspace-Id header</li>
 *   <li>User's role in that workspace</li>
 * </ul>
 *
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

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
                filterChain.doFilter(request, response);
                return;
            }

            String username = jwtUtil.extractUsername(token);

            if (username == null || SecurityContextHolder.getContext().getAuthentication() != null) {
                filterChain.doFilter(request, response);
                return;
            }

            User user = userRepository.findByEmail(username).orElse(null);

            if (user == null || !jwtUtil.validateToken(token, username)) {
                filterChain.doFilter(request, response);
                return;
            }

            // User is valid - authenticate with or without workspace
            authenticateUser(user, workspaceIdHeader);

            filterChain.doFilter(request, response);

        } finally {
            // Clear the workspace value from the context after request is complete
            // to avid memory lieaks
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
            authenticateWithoutRole(user);
            return;
        }

        try {
            Long workspaceId = Long.parseLong(workspaceIdHeader);
            authenticateWithWorkspace(user, workspaceId);
        } catch (NumberFormatException e) {
            authenticateWithoutRole(user);
        }
    }

    private void authenticateWithWorkspace(User user, Long workspaceId) {
        Optional<Role> roleOpt = workspaceMemberRepository
                .findRoleByUserIdAndWorkspaceId(user.getId(), workspaceId);

        if (roleOpt.isPresent()) {
            WorkspaceContext.setWorkspaceId(workspaceId);

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
            authenticateWithoutRole(user);
        }
    }

    // TODO: Update this method name to a better name
    private void authenticateWithoutRole(User user) {
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        Collections.emptyList() // Role is no longer relevant to be attached to a user every time in this case the user exists without a role and thus out of any workspace
                );

        SecurityContextHolder.getContext().setAuthentication(authToken);
    }
}