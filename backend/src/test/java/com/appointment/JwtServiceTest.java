package com.appointment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.appointment.entity.Role;
import com.appointment.entity.User;
import com.appointment.security.JwtProperties;
import com.appointment.security.JwtService;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class JwtServiceTest {

    private static final String SECRET = "unit-test-secret-with-at-least-32-bytes-长度-abcdef";

    private User user() {
        User u = new User("a@b.com", "hash", "A", Role.CLIENT, "UTC");
        ReflectionTestUtils.setField(u, "id", UUID.randomUUID());
        return u;
    }

    @Test
    void roundTripsUserId() {
        JwtService svc = new JwtService(new JwtProperties(SECRET, 60));
        User u = user();
        assertThat(svc.parseUserId(svc.generateToken(u))).contains(u.getId());
    }

    @Test
    void rejectsTamperedExpiredAndForeignKeyTokens() {
        JwtService svc = new JwtService(new JwtProperties(SECRET, 60));
        String token = svc.generateToken(user());
        int sig = token.lastIndexOf('.') + 5;
        char flipped = token.charAt(sig) == 'A' ? 'B' : 'A';
        String tampered = token.substring(0, sig) + flipped + token.substring(sig + 1);
        assertThat(svc.parseUserId(tampered)).isEmpty();
        assertThat(svc.parseUserId("not-a-jwt")).isEmpty();

        JwtService expired = new JwtService(new JwtProperties(SECRET, -10));
        assertThat(expired.parseUserId(expired.generateToken(user()))).isEmpty();

        JwtService other = new JwtService(new JwtProperties(SECRET.replace("unit", "othr"), 60));
        assertThat(svc.parseUserId(other.generateToken(user()))).isEmpty();
    }

    @Test
    void failsFastOnShortOrMissingSecret() {
        assertThatThrownBy(() -> new JwtService(new JwtProperties("short", 60))).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new JwtService(new JwtProperties(null, 60))).isInstanceOf(IllegalStateException.class);
    }
}
