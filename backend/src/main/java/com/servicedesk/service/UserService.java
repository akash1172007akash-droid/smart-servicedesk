package com.servicedesk.service;

import com.servicedesk.dto.CreateUserRequest;
import com.servicedesk.dto.UpdateUserRequest;
import com.servicedesk.dto.UserDto;

import java.util.List;

public interface UserService {
    List<UserDto> getAllUsers();
    UserDto getUserById(Long id);
    List<UserDto> getSupportAgents();
    UserDto createUser(CreateUserRequest request);
    UserDto updateUser(Long id, UpdateUserRequest request);
    UserDto toggleUserStatus(Long id);
}
