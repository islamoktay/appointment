package com.appointment.repository;

import com.appointment.entity.ProviderSchedule;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProviderScheduleRepository extends JpaRepository<ProviderSchedule, UUID> {

    List<ProviderSchedule> findByProviderIdOrderByDayOfWeekAsc(UUID providerId);

    Optional<ProviderSchedule> findByProviderIdAndDayOfWeek(UUID providerId, int dayOfWeek);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from ProviderSchedule s where s.provider.id = :providerId")
    void deleteAllByProviderId(@Param("providerId") UUID providerId);
}
