package com.appointment.dto;

import java.time.Instant;
import java.util.Map;

/** Locked standard error envelope. */
public record ErrorResponse(
        Instant timestamp, int status, String error, String message, String path, Map<String, String> fieldErrors) {

    public static ErrorResponse of(org.springframework.http.HttpStatus status, String message, String path) {
        return of(status, message, path, Map.of());
    }

    public static ErrorResponse of(
            org.springframework.http.HttpStatus status, String message, String path, Map<String, String> fieldErrors) {
        return new ErrorResponse(Instant.now(), status.value(), errorName(status), message, path, fieldErrors);
    }

    private static String errorName(org.springframework.http.HttpStatus status) {
        return switch (status) {
            case BAD_REQUEST -> "BAD_REQUEST";
            case UNAUTHORIZED -> "UNAUTHORIZED";
            case FORBIDDEN -> "FORBIDDEN";
            case NOT_FOUND -> "NOT_FOUND";
            case CONFLICT -> "CONFLICT";
            default -> "INTERNAL_SERVER_ERROR";
        };
    }
}
