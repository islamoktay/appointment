package com.appointment.service;

import com.appointment.dto.AppointmentResponse;
import com.appointment.dto.CreateAppointmentRequest;
import com.appointment.entity.Appointment;
import com.appointment.entity.AppointmentStatus;
import com.appointment.entity.Role;
import com.appointment.entity.User;
import com.appointment.exception.BusinessRuleException;
import com.appointment.exception.ResourceConflictException;
import com.appointment.exception.ResourceNotFoundException;
import com.appointment.repository.AppointmentRepository;
import com.appointment.repository.ProviderScheduleRepository;
import com.appointment.repository.UserRepository;
import com.appointment.security.AuthenticatedUser;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppointmentService {

    static final String SLOT_TAKEN = "This time slot has just been booked by another client.";
    private static final List<AppointmentStatus> ACTIVE = List.of(AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS);

    private final AppointmentRepository appointments;
    private final UserRepository users;
    private final ProviderScheduleRepository schedules;
    private final SlotCalculationService slotCalculator;

    public AppointmentService(
            AppointmentRepository appointments,
            UserRepository users,
            ProviderScheduleRepository schedules,
            SlotCalculationService slotCalculator) {
        this.appointments = appointments;
        this.users = users;
        this.schedules = schedules;
        this.slotCalculator = slotCalculator;
    }

    /** clientId is always the authenticated principal, never taken from the payload. */
    @Transactional
    public AppointmentResponse book(UUID clientId, CreateAppointmentRequest req) {
        User provider = users.findById(req.providerId())
                .filter(u -> u.getRole() == Role.PROVIDER)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        User client = users.findById(clientId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ZoneId zone = ZoneId.of(provider.getTimezone());
        LocalDate date = req.appointmentDate();
        LocalTime start = req.startTime();

        var day = schedules.findByProviderIdAndDayOfWeek(provider.getId(), date.getDayOfWeek().getValue())
                .orElse(null);
        // Slots ignoring bookings: validates the time is a real, non-past slot of the provider's schedule.
        var bookable = slotCalculator.calculate(day, zone, date, Set.of());
        var slot = bookable.stream()
                .filter(s -> s.startTime().equals(start))
                .findFirst()
                .orElseThrow(() -> new BusinessRuleException(
                        "Requested time is not an available slot in the provider's schedule."));

        if (new HashSet<>(appointments.findStartTimes(provider.getId(), date, ACTIVE)).contains(start)) {
            throw new ResourceConflictException(SLOT_TAKEN);
        }
        try {
            Appointment saved =
                    appointments.saveAndFlush(new Appointment(provider, client, date, start, slot.endTime()));
            return AppointmentResponse.from(saved);
        } catch (DataIntegrityViolationException | OptimisticLockingFailureException e) {
            // idx_unique_active_slot lost the race; never leak constraint details.
            throw new ResourceConflictException(SLOT_TAKEN);
        }
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> listMine(AuthenticatedUser me, LocalDate date, List<AppointmentStatus> statuses) {
        List<Appointment> all = me.role() == Role.PROVIDER
                ? appointments.findByProviderOrdered(me.id())
                : appointments.findByClientOrdered(me.id());
        return all.stream()
                .filter(a -> date == null || a.getAppointmentDate().equals(date))
                .filter(a -> statuses == null || statuses.isEmpty() || statuses.contains(a.getStatus()))
                .map(AppointmentResponse::from)
                .toList();
    }

    @Transactional
    public AppointmentResponse start(UUID providerId, UUID id) {
        Appointment a = load(id);
        requireProvider(a, providerId);
        return transition(a, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS);
    }

    @Transactional
    public AppointmentResponse complete(UUID providerId, UUID id) {
        Appointment a = load(id);
        requireProvider(a, providerId);
        return transition(a, AppointmentStatus.IN_PROGRESS, AppointmentStatus.COMPLETED);
    }

    @Transactional
    public AppointmentResponse cancel(UUID userId, UUID id) {
        Appointment a = load(id);
        if (!a.getClient().getId().equals(userId) && !a.getProvider().getId().equals(userId)) {
            throw new AccessDeniedException("Not a participant of this appointment");
        }
        if (!a.getStatus().isActive()) {
            throw new ResourceConflictException("Appointment is already " + a.getStatus() + " and cannot be cancelled.");
        }
        a.setStatus(AppointmentStatus.CANCELLED);
        return flush(a);
    }

    private AppointmentResponse transition(Appointment a, AppointmentStatus expected, AppointmentStatus next) {
        if (a.getStatus() != expected) {
            throw new ResourceConflictException(
                    "Cannot move appointment from " + a.getStatus() + " to " + next + ".");
        }
        a.setStatus(next);
        return flush(a);
    }

    private AppointmentResponse flush(Appointment a) {
        try {
            return AppointmentResponse.from(appointments.saveAndFlush(a));
        } catch (OptimisticLockingFailureException e) {
            throw new ResourceConflictException("The appointment was modified concurrently. Please retry.");
        }
    }

    private Appointment load(UUID id) {
        return appointments.findDetailedById(id).orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
    }

    private void requireProvider(Appointment a, UUID providerId) {
        if (!a.getProvider().getId().equals(providerId)) {
            throw new AccessDeniedException("Not the provider of this appointment");
        }
    }
}
