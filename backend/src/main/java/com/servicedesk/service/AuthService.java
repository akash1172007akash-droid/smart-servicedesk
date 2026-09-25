package com.servicedesk.service;

import com.servicedesk.dto.AuthResponse;
import com.servicedesk.dto.LoginRequest;
import com.servicedesk.dto.RegisterRequest;

public interface AuthService {
    AuthResponse login(LoginRequest loginRequest);
    AuthResponse register(RegisterRequest registerRequest);
}
