package com.appointment.dto;

import java.util.List;
import java.util.UUID;

public record ProviderScheduleResponse(
        UUID providerId, String providerName, String timezone, List<ScheduleDayDto> days) {}
