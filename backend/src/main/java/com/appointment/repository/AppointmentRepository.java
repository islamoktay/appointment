package com.appointment.repository;

import com.appointment.entity.Appointment;
import com.appointment.entity.AppointmentStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    @Query("select a.startTime from Appointment a where a.provider.id = :providerId "
            + "and a.appointmentDate = :date and a.status in :statuses")
    List<LocalTime> findStartTimes(
            @Param("providerId") UUID providerId,
            @Param("date") LocalDate date,
            @Param("statuses") Collection<AppointmentStatus> statuses);

    @Query("select a from Appointment a join fetch a.provider join fetch a.client where a.id = :id")
    Optional<Appointment> findDetailedById(@Param("id") UUID id);

    @Query("select a from Appointment a join fetch a.provider join fetch a.client "
            + "where a.provider.id = :userId order by a.appointmentDate asc, a.startTime asc")
    List<Appointment> findByProviderOrdered(@Param("userId") UUID userId);

    @Query("select a from Appointment a join fetch a.provider join fetch a.client "
            + "where a.client.id = :userId order by a.appointmentDate asc, a.startTime asc")
    List<Appointment> findByClientOrdered(@Param("userId") UUID userId);
}
