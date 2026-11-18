package com.appointment.controller;

import com.appointment.dto.AvailableSlotsResponse;
import com.appointment.dto.ProviderScheduleResponse;
import com.appointment.dto.ProviderSummaryDto;
import com.appointment.dto.UpdateScheduleRequest;
import com.appointment.security.AuthenticatedUser;
import com.appointment.service.ProviderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/providers")
@Tag(name = "Providers")
public class ProviderController {

    private final ProviderService providerService;

    public ProviderController(ProviderService providerService) {
        this.providerService = providerService;
    }

    @Operation(summary = "List providers, optionally filtered by name/email")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<ProviderSummaryDto> list(@RequestParam(required = false) String search) {
        return providerService.list(search);
    }

    @Operation(summary = "Provider weekly schedule")
    @GetMapping("/{id}/schedule")
    @PreAuthorize("isAuthenticated()")
    public ProviderScheduleResponse schedule(@PathVariable UUID id) {
        return providerService.getSchedule(id);
    }

    @Operation(summary = "Atomically replace the authenticated provider's weekly schedule")
    @PutMapping("/schedule")
    @PreAuthorize("hasRole('PROVIDER')")
    public ProviderScheduleResponse updateSchedule(
            @AuthenticationPrincipal AuthenticatedUser principal, @Valid @RequestBody UpdateScheduleRequest request) {
        return providerService.updateSchedule(principal.id(), request);
    }

    @Operation(summary = "Available (unbooked, non-past) slots for a date")
    @GetMapping("/{id}/slots")
    @PreAuthorize("isAuthenticated()")
    public AvailableSlotsResponse slots(
            @PathVariable UUID id, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return providerService.getSlots(id, date);
    }
}
