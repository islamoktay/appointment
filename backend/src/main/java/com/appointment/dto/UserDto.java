package com.appointment.dto;

import com.appointment.entity.Role;
import com.appointment.entity.User;
import java.util.UUID;

public record UserDto(UUID id, String email, String fullName, Role role, String timezone) {

    public static UserDto from(User user) {
        return new UserDto(user.getId(), user.getEmail(), user.getFullName(), user.getRole(), user.getTimezone());
    }
}
