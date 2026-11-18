package com.appointment.service;

import com.appointment.dto.AuthResponse;
import com.appointment.dto.LoginRequest;
import com.appointment.dto.RegisterRequest;
import com.appointment.dto.UserDto;
import com.appointment.entity.User;
import com.appointment.exception.AuthenticationFailedException;
import com.appointment.exception.BusinessRuleException;
import com.appointment.exception.ResourceConflictException;
import com.appointment.exception.ResourceNotFoundException;
import com.appointment.repository.UserRepository;
import com.appointment.security.JwtService;
import java.time.DateTimeException;
import java.time.ZoneId;
import java.util.Locale;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    static final String INVALID_CREDENTIALS = "Invalid email or password";
    private static final String DUMMY_HASH_SOURCE = "dummy-password-for-timing";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final String dummyHash;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.dummyHash = passwordEncoder.encode(DUMMY_HASH_SOURCE);
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = normalize(req.email());
        String timezone = resolveTimezone(req.timezone());
        if (userRepository.existsByEmail(email)) {
            throw new ResourceConflictException("Email is already registered");
        }
        User user;
        try {
            user = userRepository.saveAndFlush(new User(
                    email, passwordEncoder.encode(req.password()), req.fullName().trim(), req.role(), timezone));
        } catch (DataIntegrityViolationException e) {
            throw new ResourceConflictException("Email is already registered");
        }
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(normalize(req.email())).orElse(null);
        // Constant-ish timing: always run a BCrypt comparison to limit user enumeration.
        boolean ok = passwordEncoder.matches(req.password(), user != null ? user.getPasswordHash() : dummyHash);
        if (user == null || !ok) {
            throw new AuthenticationFailedException(INVALID_CREDENTIALS);
        }
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public UserDto me(UUID userId) {
        return userRepository
                .findById(userId)
                .map(UserDto::from)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private AuthResponse toResponse(User user) {
        return AuthResponse.bearer(jwtService.generateToken(user), jwtService.getExpirationSeconds(), UserDto.from(user));
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static String resolveTimezone(String tz) {
        if (tz == null || tz.isBlank()) {
            return "UTC";
        }
        try {
            return ZoneId.of(tz.trim()).getId();
        } catch (DateTimeException e) {
            throw new BusinessRuleException("Invalid IANA timezone");
        }
    }
}
