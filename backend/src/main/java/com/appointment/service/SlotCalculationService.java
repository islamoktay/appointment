package com.appointment.service;

import com.appointment.dto.TimeSlotDto;
import com.appointment.entity.ProviderSchedule;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;

/** Pure slot generation in the provider's IANA timezone (no persistence access). */
@Service
public class SlotCalculationService {

    private final Clock clock;

    public SlotCalculationService(Clock clock) {
        this.clock = clock;
    }

    public LocalDate today(ZoneId zone) {
        return LocalDate.now(clock.withZone(zone));
    }

    /**
     * @param day the provider's shift for date's ISO weekday, or null if not working
     * @param bookedStarts start times held by CONFIRMED / IN_PROGRESS appointments (excluded)
     */
    public List<TimeSlotDto> calculate(ProviderSchedule day, ZoneId zone, LocalDate date, Set<LocalTime> bookedStarts) {
        List<TimeSlotDto> slots = new ArrayList<>();
        if (day == null) {
            return slots;
        }
        var now = java.time.ZonedDateTime.now(clock.withZone(zone));
        LocalDate today = now.toLocalDate();
        if (date.isBefore(today)) {
            return slots;
        }
        boolean isToday = date.equals(today);
        LocalTime nowTime = now.toLocalTime();
        int step = day.getSlotDurationMinutes();
        LocalTime start = day.getStartTime();
        LocalTime end = day.getEndTime();
        // Compute with minutes-of-day to avoid LocalTime wrap-around at midnight.
        int endMin = end.getHour() * 60 + end.getMinute();
        for (int s = start.getHour() * 60 + start.getMinute(); s + step <= endMin; s += step) {
            LocalTime slotStart = LocalTime.of(s / 60, s % 60);
            LocalTime slotEnd = LocalTime.of((s + step) / 60, (s + step) % 60); // end <= 23:59, so never wraps
            if (isToday && !slotStart.isAfter(nowTime)) {
                continue;
            }
            if (bookedStarts.contains(slotStart)) {
                continue;
            }
            slots.add(new TimeSlotDto(slotStart, slotEnd));
        }
        return slots;
    }
}
