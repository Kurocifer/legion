package com.legion.auth.dto;

import com.legion.user.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDto {

    private Long id;
    private String email;
    private String fullName;

    public static UserDto fromUser(User user) {
        UserDto dto = new UserDto();
        dto.id = user.getId();
        dto.email = user.getEmail();
        dto.fullName = user.getFullName();
        return dto;
    }

}
