package com.appointment;

import static org.assertj.core.api.Assertions.assertThat;

import com.appointment.dto.TimeSlotDto;
import com.appointment.entity.ProviderSchedule;
import com.appointment.service.SlotCalculationService;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

class SlotCalculationServiceTest {

    private static final ZoneId ISTANBUL = ZoneId.of("Europe/Istanbul"); // UTC+3
    // 2026-11-20 (Friday) 10:15 in Istanbul == 07:15 UTC
    private final Clock clock = Clock.fixed(Instant.parse("2026-11-20T07:15:00Z"), ZoneOffset.UTC);
    private final SlotCalculationService service = new SlotCalculationService(clock);

    private ProviderSchedule shift(String start, String end, int minutes) {
        return new ProviderSchedule(null, 5, LocalTime.parse(start), LocalTime.parse(end), minutes);
    }

    private List<String> starts(List<TimeSlotDto> slots) {
        return slots.stream().map(s -> s.startTime().toString()).toList();
    }

    @Test
    void generatesUniformSlotsAndDropsTrailingRemainder() {
        var slots = service.calculate(shift("09:00", "10:45", 30), ISTANBUL, LocalDate.parse("2026-11-27"), Set.of());
        assertThat(starts(slots)).containsExactly("09:00", "09:30", "10:00");
        assertThat(slots.get(2).endTime()).isEqualTo(LocalTime.of(10, 30));
    }

    @Test
    void noShiftOrPastDateYieldsEmpty() {
        assertThat(service.calculate(null, ISTANBUL, LocalDate.parse("2026-11-27"), Set.of())).isEmpty();
        assertThat(service.calculate(shift("09:00", "12:00", 60), ISTANBUL, LocalDate.parse("2026-11-19"), Set.of()))
                .isEmpty();
    }

    @Test
    void todayStripsSlotsAtOrBeforeCurrentTimeInProviderTimezone() {
        var slots = service.calculate(shift("09:00", "12:00", 30), ISTANBUL, LocalDate.parse("2026-11-20"), Set.of());
        assertThat(starts(slots)).containsExactly("10:30", "11:00", "11:30");
    }

    @Test
    void todayIsEvaluatedInProviderZoneNotUtc() {
        // 22:30 UTC on the 20th is already the 21st in Istanbul, so the 20th is past there.
        var late = new SlotCalculationService(Clock.fixed(Instant.parse("2026-11-20T22:30:00Z"), ZoneOffset.UTC));
        assertThat(late.calculate(shift("09:00", "12:00", 60), ISTANBUL, LocalDate.parse("2026-11-20"), Set.of()))
                .isEmpty();
    }

    @Test
    void excludesBookedStarts() {
        var slots = service.calculate(
                shift("09:00", "11:00", 60), ISTANBUL, LocalDate.parse("2026-11-27"), Set.of(LocalTime.of(9, 0)));
        assertThat(starts(slots)).containsExactly("10:00");
    }
}
