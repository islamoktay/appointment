package com.appointment.service;

import com.appointment.dto.AvailableSlotsResponse;
import com.appointment.dto.ProviderScheduleResponse;
import com.appointment.dto.ProviderSummaryDto;
import com.appointment.dto.ScheduleDayDto;
import com.appointment.dto.UpdateScheduleRequest;
import com.appointment.entity.AppointmentStatus;
import com.appointment.entity.ProviderSchedule;
import com.appointment.entity.Role;
import com.appointment.entity.User;
import com.appointment.exception.BusinessRuleException;
import com.appointment.exception.ResourceNotFoundException;
import com.appointment.repository.AppointmentRepository;
import com.appointment.repository.ProviderScheduleRepository;
import com.appointment.repository.UserRepository;
import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProviderService {

    private static final Set<Integer> ALLOWED_DURATIONS = Set.of(15, 30, 60);

    private final UserRepository users;
    private final ProviderScheduleRepository schedules;
    private final AppointmentRepository appointments;
    private final SlotCalculationService slotCalculator;

    public ProviderService(
            UserRepository users,
            ProviderScheduleRepository schedules,
            AppointmentRepository appointments,
            SlotCalculationService slotCalculator) {
        this.users = users;
        this.schedules = schedules;
        this.appointments = appointments;
        this.slotCalculator = slotCalculator;
    }

    @Transactional(readOnly = true)
    public List<ProviderSummaryDto> list(String search) {
        String term = search == null ? "" : search.trim();
        return users.searchByRole(Role.PROVIDER, term).stream()
                .map(u -> new ProviderSummaryDto(u.getId(), u.getFullName(), u.getEmail(), u.getTimezone()))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProviderScheduleResponse getSchedule(UUID providerId) {
        return toResponse(requireProvider(providerId));
    }

    @Transactional
    public ProviderScheduleResponse updateSchedule(UUID providerId, UpdateScheduleRequest req) {
        User provider = requireProvider(providerId);
        validate(req);
        if (req.timezone() != null && !req.timezone().isBlank()) {
            provider.setTimezone(req.timezone().trim());
        }
        schedules.deleteAllByProviderId(providerId);
        // Re-attach after the bulk delete cleared the persistence context.
        User managed = requireProvider(providerId);
        schedules.saveAll(req.days().stream()
                .map(d -> new ProviderSchedule(
                        managed, d.dayOfWeek(), d.startTime(), d.endTime(), d.slotDurationMinutes()))
                .toList());
        return toResponse(managed);
    }

    @Transactional(readOnly = true)
    public AvailableSlotsResponse getSlots(UUID providerId, LocalDate date) {
        User provider = requireProvider(providerId);
        ZoneId zone = ZoneId.of(provider.getTimezone());
        var day = schedules.findByProviderIdAndDayOfWeek(providerId, date.getDayOfWeek().getValue()).orElse(null);
        var booked = new HashSet<>(appointments.findStartTimes(
                providerId, date, List.of(AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS)));
        return new AvailableSlotsResponse(
                provider.getId(),
                provider.getFullName(),
                date,
                provider.getTimezone(),
                slotCalculator.calculate(day, zone, date, booked));
    }

    User requireProvider(UUID id) {
        return users.findById(id)
                .filter(u -> u.getRole() == Role.PROVIDER)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
    }

    private ProviderScheduleResponse toResponse(User provider) {
        List<ScheduleDayDto> days = schedules.findByProviderIdOrderByDayOfWeekAsc(provider.getId()).stream()
                .map(s -> new ScheduleDayDto(
                        s.getDayOfWeek(), s.getStartTime(), s.getEndTime(), s.getSlotDurationMinutes()))
                .toList();
        return new ProviderScheduleResponse(provider.getId(), provider.getFullName(), provider.getTimezone(), days);
    }

    private void validate(UpdateScheduleRequest req) {
        if (req.timezone() != null && !req.timezone().isBlank()) {
            try {
                ZoneId.of(req.timezone().trim());
            } catch (DateTimeException e) {
                throw new BusinessRuleException("Invalid IANA timezone");
            }
        }
        Set<Integer> seen = new HashSet<>();
        for (ScheduleDayDto d : req.days()) {
            if (!seen.add(d.dayOfWeek())) {
                throw new BusinessRuleException("Duplicate dayOfWeek " + d.dayOfWeek() + " in schedule");
            }
            if (!d.startTime().isBefore(d.endTime())) {
                throw new BusinessRuleException("startTime must be before endTime for day " + d.dayOfWeek());
            }
            if (!ALLOWED_DURATIONS.contains(d.slotDurationMinutes())) {
                throw new BusinessRuleException("slotDurationMinutes must be one of 15, 30, 60");
            }
        }
    }
}
