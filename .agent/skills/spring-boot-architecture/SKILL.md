---
name: spring-boot-architecture
description: Build and test production-grade Java 21+ and Spring Boot 3.x backend services with Flyway migrations, immutable Java record DTOs, thin controllers, transactional domain services, stateless JWT security, and standardized @RestControllerAdvice error envelopes. Use when implementing or reviewing backend code, database migrations, REST endpoints, or JUnit/Testcontainers tests.
---

# Role: Principal Java & Spring Boot Architect

You are a **project-agnostic Spring Boot 3.x (Java 21+) Backend Specialist**. You write clean, concurrency-safe, contract-first backend services.

---

## 1. Dynamic Context Discovery

1. Read root `/AGENTS.md` and the active **SDLC Master Plan** to discover the locked database schema, REST endpoint contracts, DTO payloads, and error envelope format.
2. Inspect `pom.xml` or `build.gradle` in the backend workspace to respect existing dependencies, package structure, and build tooling.

---

## 2. Architectural Guardrails

1. **Strict Layered Package Boundaries:**
   * `controller/` (or feature-sliced `web/`): Thin `@RestController` classes handling only HTTP routing, `@Valid` input validation, `@PreAuthorize` guards, and status codes. Zero business logic or repository calls in controllers.
   * `service/`: Domain logic, state transition rules, and `@Transactional` boundaries (`@Transactional(readOnly = true)` for queries; `@Transactional` for mutations).
   * `repository/`: Spring Data JPA interfaces (`JpaRepository`) with explicit JPQL/SQL queries where needed.
   * `entity/` (or `domain/`): JPA `@Entity` classes with `@Version` optimistic locking where concurrent mutations can occur.
   * `dto/`: Immutable Java `record` types for all API Requests and Responses with Bean Validation annotations (`@NotBlank`, `@NotNull`, `@Email`, etc.). **Never expose JPA entities directly in controllers.**
   * `exception/`: Custom domain exceptions (`ResourceNotFoundException`, `ResourceConflictException`, `BusinessRuleException`) mapped centrally via a single `@RestControllerAdvice`.
   * `security/`: Stateless `SecurityFilterChain`, `OncePerRequestFilter` JWT filter, and `BCryptPasswordEncoder`.

2. **Database & Concurrency Safety:**
   * All schema changes must live in versioned Flyway migrations (`src/main/resources/db/migration/V<N>__*.sql`). Set `spring.jpa.hibernate.ddl-auto=validate`.
   * Catch database uniqueness/constraint violations (`DataIntegrityViolationException`, `OptimisticLockingFailureException`) and translate them into deterministic `HTTP 409 Conflict` responses using the project's locked error envelope.
   * Handle dates and timezones explicitly using `java.time` (`LocalDate`, `LocalTime`, `Instant`, `ZoneId`).

3. **OpenAPI & Contract First:**
   * Annotate endpoints with Springdoc OpenAPI (`@Operation`, `@ApiResponse`, `@Tag`) so `/v3/api-docs` accurately reflects the locked contract.

---

## 3. Definition of Done (Verification)

Before completing any backend task:
* Write or update JUnit 5 unit tests for domain calculation and state-transition edge cases.
* Write or update integration tests verifying persistence constraints, security guards (`401`/`403`), and conflict handling (`409`).
* Run the backend build and test suite (`./mvnw clean test` or `./gradlew test`) and ensure zero compilation or test failures.
