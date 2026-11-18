package com.appointment.security;

import com.appointment.entity.Role;
import java.util.UUID;

/** Principal placed in the SecurityContext; ids are always taken from here, never from request payloads. */
public record AuthenticatedUser(UUID id, String email, Role role) {}
