package com.hackhub.service;

import com.hackhub.entities.Organization;
import com.hackhub.entities.User;
import com.hackhub.repository.OrganizationRepository;
import com.hackhub.repository.UserRepository;
import com.hackhub.requestdto.*;
import com.hackhub.responsedto.*;
import com.hackhub.security.SecurityUtils;
import com.hackhub.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public UserService(OrganizationRepository organizationRepository, UserRepository userRepository,
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil, AuthenticationManager authenticationManager) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    // Login method
    public LoginResponseDto loginUser(LoginRequestDto request) {
        try{
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception e) {
            throw new RuntimeException("Invalid email or password");
        }

        // Load user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));


        // Check if organizer is approved or not
        if ("ORGANIZER".equalsIgnoreCase(user.getRole()) && "PENDING".equalsIgnoreCase(user.getStatus())){
            throw new RuntimeException("Your account is not approved yet, please wait for the admin approval");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());

        return LoginResponseDto.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }

    // Register Participant
    public ParticipantResponseDto registerParticipant(ParticipantRequestDto request) {

        if (userRepository.existsByEmail(request.getEmail()))
            throw new RuntimeException("Email already registered");

        if (!request.getPassword().equals(request.getConfirmPassword()))
            throw new RuntimeException("Passwords do not match");

        // Find or create organization
        Organization organization = organizationRepository
                .findByName(request.getCollegeName())
                .orElseGet(() -> organizationRepository.save(
                        Organization.builder()
                                .name(request.getCollegeName())
                                .type("COLLEGE")
                                .build()
                ));


        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("PARTICIPANT")
                .status("APPROVED")
                .organization(organization)
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);


        return ParticipantResponseDto.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .password(savedUser.getPassword()) // TODO: remove before production
                .collegeName(savedUser.getOrganization().getName())
                .role(savedUser.getRole())
                .status(savedUser.getStatus())
                .createdAt(savedUser.getCreatedAt())
                .build();
    }

    // Register Organizer
    public OrganizerResponseDto registerOrganizer(OrganizerRequestDto request) {

        if (userRepository.existsByEmail(request.getEmail()))
            throw new RuntimeException("Email already registered");

        if (!request.getPassword().equals(request.getConfirmPassword()))
            throw new RuntimeException("Passwords do not match");

        // Find or create organization
        Organization organization = organizationRepository
                .findByName(request.getOrganizationName())
                .orElseGet(() -> organizationRepository.save(
                        Organization.builder()
                                .name(request.getOrganizationName())
                                .type("COLLEGE")
                                .build()
                ));


        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("ORGANIZER")
                .status("PENDING")
                .organization(organization)
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);


        return OrganizerResponseDto.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .password(savedUser.getPassword()) // TODO: remove before production
                .organizationName(savedUser.getOrganization().getName())
                .role(savedUser.getRole())
                .status(savedUser.getStatus())
                .createdAt(savedUser.getCreatedAt())
                .build();
    }

    // Register Judge
    public JudgeResponseDto registerJudge(JudgeRequestDto request) {

        if (userRepository.existsByEmail(request.getEmail()))
            throw new RuntimeException("Email already registered");

        if (!request.getPassword().equals(request.getConfirmPassword()))
            throw new RuntimeException("Passwords do not match");


        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .designation(request.getDesignation())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("JUDGE")
                .status("APPROVED")
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);


        return JudgeResponseDto.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .password(savedUser.getPassword()) // TODO: remove before production
                .designation(savedUser.getDesignation())
                .role(savedUser.getRole())
                .status(savedUser.getStatus())
                .createdAt(savedUser.getCreatedAt())
                .build();
    }

    // Get user by id
    public UserResponseDto getUserById(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException(
                        "User not found with id: " + userId));
        return UserResponseDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .designation(user.getDesignation())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }

    // Approve organizer
    public UserResponseDto approveOrganizer(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException(
                        "User not found with id: " + userId));

        if (!"ORGANIZER".equalsIgnoreCase(user.getRole()))
            throw new RuntimeException("Only ORGANIZER status can be approved");

        if ("APPROVED".equalsIgnoreCase(user.getStatus()))
            throw new RuntimeException("Organizer is already approved");

        user.setStatus("APPROVED");
        User saved = userRepository.save(user);

        return UserResponseDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .role(saved.getRole())
                .designation(saved.getDesignation())
                .status(saved.getStatus())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    // Reject organizer
    public UserResponseDto rejectOrganizer(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException(
                        "User not found with id: " + userId));

        if (!"ORGANIZER".equalsIgnoreCase(user.getRole()))
            throw new RuntimeException("Only ORGANIZER status can be rejected");

        if ("REJECTED".equalsIgnoreCase(user.getStatus()))
            throw new RuntimeException("Organizer is already rejected");

        user.setStatus("REJECTED");
        User saved = userRepository.save(user);

        return UserResponseDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .role(saved.getRole())
                .designation(saved.getDesignation())
                .status(saved.getStatus())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    // Get users by role
    public List<UserResponseDto> getUsersByRole(String role) {
        return userRepository.findAll()
                .stream()
                .filter(u -> role.equalsIgnoreCase(u.getRole()))
                .map(user -> UserResponseDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .designation(user.getDesignation())
                        .status(user.getStatus())
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // Get all user
    public List<UserResponseDto> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(user -> UserResponseDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .password(user.getPassword()) // TODO: remove before production
                        .role(user.getRole())
                        .designation(user.getDesignation())
                        .status(user.getStatus())
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
