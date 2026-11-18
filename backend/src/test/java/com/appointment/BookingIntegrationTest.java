package com.appointment;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BookingIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    String providerToken, providerId, clientToken, otherClientToken, otherProviderToken;
    final LocalDate date = LocalDate.now().plusDays(10);

    record Account(String token, String id) {}

    Account register(String role) throws Exception {
        String email = UUID.randomUUID() + "@example.com";
        var res = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"email":"%s","password":"password123","fullName":"%s User","role":"%s","timezone":"Europe/Istanbul"}"""
                                .formatted(email, role, role)))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode n = json.readTree(res.getResponse().getContentAsString());
        return new Account(n.get("accessToken").asText(), n.get("user").get("id").asText());
    }

    static final String SCHEDULE_ALL_DAYS = "{\"days\":[" + String.join(",", java.util.stream.IntStream.rangeClosed(1, 7)
            .mapToObj(d -> "{\"dayOfWeek\":" + d + ",\"startTime\":\"09:00\",\"endTime\":\"10:45\",\"slotDurationMinutes\":30}")
            .toList()) + "]}";

    @BeforeEach
    void setUp() throws Exception {
        var p = register("PROVIDER");
        providerToken = p.token();
        providerId = p.id();
        clientToken = register("CLIENT").token();
        otherClientToken = register("CLIENT").token();
        otherProviderToken = register("PROVIDER").token();
        mvc.perform(put("/api/providers/schedule").header("Authorization", "Bearer " + providerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(SCHEDULE_ALL_DAYS))
                .andExpect(status().isOk());
    }

    ResultActions book(String token, String time) throws Exception {
        return mvc.perform(post("/api/appointments").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"providerId":"%s","appointmentDate":"%s","startTime":"%s"}""".formatted(providerId, date, time)));
    }

    String bookOk(String token, String time) throws Exception {
        var res = book(token, time).andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.startTime").value(time))
                .andReturn();
        return json.readTree(res.getResponse().getContentAsString()).get("id").asText();
    }

    @Test
    void scheduleRoundTripAndSlotsExcludeBooked() throws Exception {
        mvc.perform(get("/api/providers/{id}/schedule", providerId).header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.days", hasSize(7)))
                .andExpect(jsonPath("$.days[0].startTime").value("09:00"));
        bookOk(clientToken, "09:30");
        mvc.perform(get("/api/providers/{id}/slots", providerId).param("date", date.toString())
                        .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slots", hasSize(2)))
                .andExpect(jsonPath("$.slots[0].startTime").value("09:00"))
                .andExpect(jsonPath("$.slots[1].startTime").value("10:00"));
    }

    @Test
    void secondBookingOfSameSlotReturns409AndCancelReopensIt() throws Exception {
        String id = bookOk(clientToken, "09:00");
        book(otherClientToken, "09:00").andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("CONFLICT"))
                .andExpect(jsonPath("$.message").value("This time slot has just been booked by another client."));
        mvc.perform(patch("/api/appointments/{id}/cancel", id).header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
        bookOk(otherClientToken, "09:00");
    }

    @Test
    void invalidSlotsAndRolesAreRejected() throws Exception {
        book(clientToken, "09:15").andExpect(status().isBadRequest());
        book(clientToken, "10:30").andExpect(status().isBadRequest()); // trailing remainder dropped
        book(providerToken, "09:00").andExpect(status().isForbidden()); // PROVIDER cannot book
        mvc.perform(post("/api/appointments").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(put("/api/providers/schedule").header("Authorization", "Bearer " + clientToken)
                        .contentType(MediaType.APPLICATION_JSON).content(SCHEDULE_ALL_DAYS))
                .andExpect(status().isForbidden());
    }

    @Test
    void pastDateBookingRejectedAndSlotsEmpty() throws Exception {
        mvc.perform(post("/api/appointments").header("Authorization", "Bearer " + clientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"providerId":"%s","appointmentDate":"%s","startTime":"09:00"}"""
                                .formatted(providerId, LocalDate.now().minusDays(2))))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/providers/{id}/slots", providerId)
                        .param("date", LocalDate.now().minusDays(2).toString())
                        .header("Authorization", "Bearer " + clientToken))
                .andExpect(jsonPath("$.slots", hasSize(0)));
    }

    @Test
    void scheduleValidation() throws Exception {
        String bad = "{\"days\":[{\"dayOfWeek\":1,\"startTime\":\"10:00\",\"endTime\":\"09:00\",\"slotDurationMinutes\":30}]}";
        String dup = "{\"days\":[{\"dayOfWeek\":1,\"startTime\":\"09:00\",\"endTime\":\"10:00\",\"slotDurationMinutes\":30},"
                + "{\"dayOfWeek\":1,\"startTime\":\"09:00\",\"endTime\":\"10:00\",\"slotDurationMinutes\":30}]}";
        String dur = "{\"days\":[{\"dayOfWeek\":1,\"startTime\":\"09:00\",\"endTime\":\"10:00\",\"slotDurationMinutes\":20}]}";
        String tooMany = "{\"days\":[" + "{\"dayOfWeek\":1,\"startTime\":\"09:00\",\"endTime\":\"10:00\",\"slotDurationMinutes\":30},".repeat(8)
                + "{\"dayOfWeek\":2,\"startTime\":\"09:00\",\"endTime\":\"10:00\",\"slotDurationMinutes\":30}]}";
        String tz = "{\"timezone\":\"Mars/Base\",\"days\":[]}";
        for (String body : new String[] {bad, dup, dur, tooMany, tz}) {
            mvc.perform(put("/api/providers/schedule").header("Authorization", "Bearer " + providerToken)
                            .contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    void stateMachineAndOwnership() throws Exception {
        String id = bookOk(clientToken, "10:00");
        // complete before start -> 409; client cannot start -> 403; other provider -> 403
        mvc.perform(patch("/api/appointments/{id}/complete", id).header("Authorization", "Bearer " + providerToken))
                .andExpect(status().isConflict());
        mvc.perform(patch("/api/appointments/{id}/start", id).header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/api/appointments/{id}/start", id).header("Authorization", "Bearer " + otherProviderToken))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/api/appointments/{id}/cancel", id).header("Authorization", "Bearer " + otherClientToken))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/api/appointments/{id}/start", id).header("Authorization", "Bearer " + providerToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("IN_PROGRESS"));
        // IN_PROGRESS still occupies the slot
        book(otherClientToken, "10:00").andExpect(status().isConflict());
        mvc.perform(patch("/api/appointments/{id}/complete", id).header("Authorization", "Bearer " + providerToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("COMPLETED"));
        // terminal
        mvc.perform(patch("/api/appointments/{id}/cancel", id).header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isConflict());
        mvc.perform(patch("/api/appointments/{id}/start", id).header("Authorization", "Bearer " + providerToken))
                .andExpect(status().isConflict());
        mvc.perform(patch("/api/appointments/{id}/start", UUID.randomUUID()).header("Authorization", "Bearer " + providerToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void myAppointmentsOrderedAndFiltered() throws Exception {
        bookOk(clientToken, "10:00");
        String early = bookOk(clientToken, "09:00");
        mvc.perform(get("/api/appointments/me").header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].startTime").value("09:00"))
                .andExpect(jsonPath("$[0].providerId").value(providerId));
        mvc.perform(get("/api/appointments/me").header("Authorization", "Bearer " + providerToken)
                        .param("date", date.toString()))
                .andExpect(jsonPath("$", hasSize(2)));
        mvc.perform(patch("/api/appointments/{id}/cancel", early).header("Authorization", "Bearer " + providerToken))
                .andExpect(status().isOk());
        mvc.perform(get("/api/appointments/me").header("Authorization", "Bearer " + clientToken)
                        .param("status", "CONFIRMED", "IN_PROGRESS"))
                .andExpect(jsonPath("$", hasSize(1)));
        mvc.perform(get("/api/appointments/me").header("Authorization", "Bearer " + otherClientToken))
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
