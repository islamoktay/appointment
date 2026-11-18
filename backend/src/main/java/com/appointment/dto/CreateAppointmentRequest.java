package com.appointment.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/** Deliberately has no clientId: the client is always the authenticated principal. */
public record CreateAppointmentRequest(
        @NotNull UUID providerId,
        @NotNull LocalDate appointmentDate,
        @NotNull @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm") LocalTime startTime) {}
