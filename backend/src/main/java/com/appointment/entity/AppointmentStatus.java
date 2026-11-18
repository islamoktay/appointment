package com.appointment.entity;

public enum AppointmentStatus {
    CONFIRMED,
    IN_PROGRESS,
    CANCELLED,
    COMPLETED;

    public boolean isActive() {
        return this == CONFIRMED || this == IN_PROGRESS;
    }
}
