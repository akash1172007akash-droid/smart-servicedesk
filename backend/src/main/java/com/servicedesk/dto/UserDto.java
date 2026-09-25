package com.servicedesk.dto;

import com.servicedesk.entity.Role;
import com.servicedesk.entity.User;
import com.servicedesk.entity.UserStatus;

import java.time.LocalDateTime;

public class UserDto {
    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private UserStatus status;
    private LocalDateTime createdAt;

    public UserDto() {}

    public UserDto(Long id, String fullName, String email, Role role, UserStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static UserDto fromEntity(User user) {
        if (user == null) return null;
        return new UserDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt()
        );
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
