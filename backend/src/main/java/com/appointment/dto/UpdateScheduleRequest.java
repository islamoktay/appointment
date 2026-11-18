package com.appointment.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record UpdateScheduleRequest(
        @Size(max = 64) String timezone, @NotNull @Size(max = 7) List<@NotNull @Valid ScheduleDayDto> days) {}
