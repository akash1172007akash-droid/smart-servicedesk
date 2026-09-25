package com.servicedesk.repository;

import com.servicedesk.entity.Role;
import com.servicedesk.entity.User;
import com.servicedesk.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByRoleAndStatus(Role role, UserStatus status);
    long countByRoleAndStatus(Role role, UserStatus status);
}
