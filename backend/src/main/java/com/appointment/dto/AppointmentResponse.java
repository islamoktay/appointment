package com.appointment.dto;

import com.appointment.entity.Appointment;
import com.appointment.entity.AppointmentStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record AppointmentResponse(
        UUID id,
        UUID providerId,
        String providerName,
        String providerTimezone,
        UUID clientId,
        String clientName,
        LocalDate appointmentDate,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm") LocalTime startTime,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm") LocalTime endTime,
        AppointmentStatus status,
        Instant createdAt) {

    public static AppointmentResponse from(Appointment a) {
        return new AppointmentResponse(
                a.getId(),
                a.getProvider().getId(),
                a.getProvider().getFullName(),
                a.getProvider().getTimezone(),
                a.getClient().getId(),
                a.getClient().getFullName(),
                a.getAppointmentDate(),
                a.getStartTime(),
                a.getEndTime(),
                a.getStatus(),
                a.getCreatedAt());
    }
}
