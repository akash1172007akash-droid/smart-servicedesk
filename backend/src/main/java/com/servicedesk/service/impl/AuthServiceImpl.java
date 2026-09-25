package com.servicedesk.service.impl;

import com.servicedesk.dto.AuthResponse;
import com.servicedesk.dto.LoginRequest;
import com.servicedesk.dto.RegisterRequest;
import com.servicedesk.dto.UserDto;
import com.servicedesk.entity.Role;
import com.servicedesk.entity.User;
import com.servicedesk.entity.UserStatus;
import com.servicedesk.exception.BadRequestException;
import com.servicedesk.exception.ConflictException;
import com.servicedesk.repository.UserRepository;
import com.servicedesk.security.JwtTokenProvider;
import com.servicedesk.security.UserPrincipal;
import com.servicedesk.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail().trim().toLowerCase(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("User profile not found"));

        return new AuthResponse(jwt, UserDto.fromEntity(user));
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        String email = registerRequest.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email already registered: " + email);
        }

        if (!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        User user = new User(
                registerRequest.getFullName().trim(),
                email,
                passwordEncoder.encode(registerRequest.getPassword()),
                Role.EMPLOYEE,
                UserStatus.ACTIVE
        );

        User savedUser = userRepository.save(user);

        UserPrincipal userPrincipal = UserPrincipal.create(savedUser);
        String jwt = tokenProvider.generateTokenFromUser(userPrincipal);

        return new AuthResponse(jwt, UserDto.fromEntity(savedUser));
    }
}
