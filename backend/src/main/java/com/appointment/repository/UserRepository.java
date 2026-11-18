package com.appointment.repository;

import com.appointment.entity.User;
import com.appointment.entity.Role;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    @org.springframework.data.jpa.repository.Query(
            "select u from User u where u.role = :role and (:search = '' "
                    + "or lower(u.fullName) like lower(concat('%', :search, '%')) "
                    + "or lower(u.email) like lower(concat('%', :search, '%'))) order by u.fullName asc")
    List<User> searchByRole(
            @org.springframework.data.repository.query.Param("role") Role role,
            @org.springframework.data.repository.query.Param("search") String search);

    boolean existsByEmail(String email);
}
