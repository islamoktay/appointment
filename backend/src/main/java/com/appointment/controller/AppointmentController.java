package com.appointment.controller;

import com.appointment.dto.AppointmentResponse;
import com.appointment.dto.CreateAppointmentRequest;
import com.appointment.entity.AppointmentStatus;
import com.appointment.security.AuthenticatedUser;
import com.appointment.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/appointments")
@Tag(name = "Appointments")
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    @Operation(summary = "Book a slot (409 if just taken)")
    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<AppointmentResponse> book(
            @AuthenticationPrincipal AuthenticatedUser principal, @Valid @RequestBody CreateAppointmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.book(principal.id(), request));
    }

    @Operation(summary = "My appointments (as client or provider queue), ordered by date and start time")
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public List<AppointmentResponse> mine(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) List<AppointmentStatus> status) {
        return service.listMine(principal, date, status);
    }

    @Operation(summary = "CONFIRMED -> IN_PROGRESS (owning provider only)")
    @PatchMapping("/{id}/start")
    @PreAuthorize("hasRole('PROVIDER')")
    public AppointmentResponse start(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable UUID id) {
        return service.start(principal.id(), id);
    }

    @Operation(summary = "IN_PROGRESS -> COMPLETED (owning provider only)")
    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasRole('PROVIDER')")
    public AppointmentResponse complete(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable UUID id) {
        return service.complete(principal.id(), id);
    }

    @Operation(summary = "Cancel an active appointment (owning client or provider)")
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public AppointmentResponse cancel(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable UUID id) {
        return service.cancel(principal.id(), id);
    }
}
