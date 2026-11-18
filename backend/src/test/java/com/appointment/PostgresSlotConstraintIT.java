package com.appointment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.appointment.entity.Appointment;
import com.appointment.entity.AppointmentStatus;
import com.appointment.entity.Role;
import com.appointment.entity.User;
import com.appointment.repository.AppointmentRepository;
import com.appointment.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** Verifies the real Flyway schema + idx_unique_active_slot on PostgreSQL. Skipped when Docker is unavailable. */
@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest
@ActiveProfiles("test")
class PostgresSlotConstraintIT {

    @Container static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", pg::getJdbcUrl);
        r.add("spring.datasource.username", pg::getUsername);
        r.add("spring.datasource.password", pg::getPassword);
        r.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        r.add("spring.flyway.enabled", () -> "true");
        r.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
    }

    @Autowired UserRepository users;
    @Autowired AppointmentRepository appointments;

    @Test
    void activeSlotIsUniqueButCancelledReopensIt() {
        var p = users.save(new User("p@x.com", "h", "P", Role.PROVIDER, "UTC"));
        var c = users.save(new User("c@x.com", "h", "C", Role.CLIENT, "UTC"));
        var date = LocalDate.now().plusDays(3);
        var first = appointments.saveAndFlush(new Appointment(p, c, date, LocalTime.of(9, 0), LocalTime.of(9, 30)));

        assertThatThrownBy(() -> appointments.saveAndFlush(
                        new Appointment(p, c, date, LocalTime.of(9, 0), LocalTime.of(9, 30))))
                .isInstanceOf(DataIntegrityViolationException.class);

        first.setStatus(AppointmentStatus.CANCELLED);
        appointments.saveAndFlush(first);
        var again = appointments.saveAndFlush(new Appointment(p, c, date, LocalTime.of(9, 0), LocalTime.of(9, 30)));
        assertThat(again.getId()).isNotNull();
    }
}
