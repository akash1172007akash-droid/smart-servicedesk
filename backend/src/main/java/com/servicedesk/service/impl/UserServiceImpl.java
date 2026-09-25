package com.servicedesk.service.impl;

import com.servicedesk.dto.CreateUserRequest;
import com.servicedesk.dto.UpdateUserRequest;
import com.servicedesk.dto.UserDto;
import com.servicedesk.entity.Role;
import com.servicedesk.entity.User;
import com.servicedesk.entity.UserStatus;
import com.servicedesk.exception.BadRequestException;
import com.servicedesk.exception.ConflictException;
import com.servicedesk.exception.ResourceNotFoundException;
import com.servicedesk.repository.UserRepository;
import com.servicedesk.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserDto.fromEntity(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getSupportAgents() {
        return userRepository.findByRoleAndStatus(Role.SUPPORT_AGENT, UserStatus.ACTIVE).stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email already in use: " + email);
        }

        User user = new User(
                request.getFullName().trim(),
                email,
                passwordEncoder.encode(request.getPassword()),
                request.getRole(),
                UserStatus.ACTIVE
        );

        User saved = userRepository.save(user);
        return UserDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Safeguard: Check if deactivating or changing role of the last active ADMIN
        if (user.getRole() == Role.ADMIN && (request.getRole() != Role.ADMIN || request.getStatus() == UserStatus.INACTIVE)) {
            long activeAdminCount = userRepository.countByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE);
            if (activeAdminCount <= 1) {
                throw new BadRequestException("Cannot demote or deactivate the last active administrator");
            }
        }

        user.setFullName(request.getFullName().trim());
        user.setRole(request.getRole());
        user.setStatus(request.getStatus());

        User updated = userRepository.save(user);
        return UserDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public UserDto toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (user.getStatus() == UserStatus.ACTIVE) {
            // Check if last active admin
            if (user.getRole() == Role.ADMIN) {
                long activeAdminCount = userRepository.countByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE);
                if (activeAdminCount <= 1) {
                    throw new BadRequestException("Cannot deactivate the last active administrator");
                }
            }
            user.setStatus(UserStatus.INACTIVE);
        } else {
            user.setStatus(UserStatus.ACTIVE);
        }

        User updated = userRepository.save(user);
        return UserDto.fromEntity(updated);
    }
}
