package com.legion.auth.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * Request DTO for accepting an invitation
 */
@Getter
@Setter
public class AcceptInvitationRequest {
    private String token;
    private String email;
    private String password;
    private String fullName;

}
