package com.appointment.dto;

import java.util.UUID;

public record ProviderSummaryDto(UUID id, String fullName, String email, String timezone) {}
