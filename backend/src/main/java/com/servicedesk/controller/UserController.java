package com.servicedesk.controller;

import com.servicedesk.dto.ApiResponse;
import com.servicedesk.dto.CreateUserRequest;
import com.servicedesk.dto.UpdateUserRequest;
import com.servicedesk.dto.UserDto;
import com.servicedesk.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok("Users retrieved successfully", users));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok("User retrieved successfully", user));
    }

    @GetMapping("/agents")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT_AGENT')")
    public ResponseEntity<ApiResponse<List<UserDto>>> getSupportAgents() {
        List<UserDto> agents = userService.getSupportAgents();
        return ResponseEntity.ok(ApiResponse.ok("Support agents retrieved successfully", agents));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserDto user = userService.createUser(request);
        return new ResponseEntity<>(ApiResponse.ok("User created successfully", user), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        UserDto user = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.ok("User updated successfully", user));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> toggleUserStatus(@PathVariable Long id) {
        UserDto user = userService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.ok("User status updated successfully", user));
    }
}
