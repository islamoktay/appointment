package com.appointment;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

class BootstrapContractTest {

    @Test
    void flywayV1MigrationContainsLockedSchemaAndConcurrencyIndex() throws IOException {
        ClassPathResource migration = new ClassPathResource("db/migration/V1__init_schema.sql");
        assertThat(migration.exists()).isTrue();

        String sql = migration.getContentAsString(StandardCharsets.UTF_8);
        assertThat(sql)
                .contains("CREATE TABLE users")
                .contains("timezone VARCHAR(64) NOT NULL DEFAULT 'UTC'")
                .contains("CREATE TABLE provider_schedules")
                .contains("CONSTRAINT chk_schedule_time_window CHECK (start_time < end_time)")
                .contains("CONSTRAINT unq_provider_day UNIQUE (provider_id, day_of_week)")
                .contains("CREATE TABLE appointments")
                .contains("CONSTRAINT chk_appointment_time_window CHECK (start_time < end_time)")
                .contains("CREATE UNIQUE INDEX idx_unique_active_slot")
                .contains("WHERE status IN ('CONFIRMED', 'IN_PROGRESS')");
    }

    @Test
    void mainApplicationConfigEnforcesSecurityRedLines() throws IOException {
        ClassPathResource config = new ClassPathResource("application.yml");
        assertThat(config.exists()).isTrue();

        String yaml = config.getContentAsString(StandardCharsets.UTF_8);
        assertThat(yaml)
                .contains("ddl-auto: validate")
                .contains("open-in-view: false")
                .contains("secret: ${JWT_SECRET}")
                .doesNotContain("${JWT_SECRET:")
                .contains("include: health");
    }
}
