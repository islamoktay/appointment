package com.appointment.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record AvailableSlotsResponse(
        UUID providerId, String providerName, LocalDate date, String timezone, List<TimeSlotDto> slots) {}
