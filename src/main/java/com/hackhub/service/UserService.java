package com.hackhub.service;

import com.hackhub.entities.User;
import com.hackhub.repository.UserRepository;
import com.hackhub.requestdto.UserRequestDto;
import com.hackhub.responsedto.UserResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Register user
    public UserResponseDto registerUser(UserRequestDto request) {


        if (userRepository.existsByEmail(request.getEmail()))
            throw new RuntimeException("Email already registered");


        List<String> validRoles = Arrays.asList("JUDGE", "ORGANIZER", "PARTICIPANT");
        if (!validRoles.contains(request.getRole().toUpperCase()))
            throw new RuntimeException("Invalid role: " + request.getRole() + ". Allowed: JUDGE, ORGANIZER, PARTICIPANT");


        String status = request.getRole().equalsIgnoreCase("ORGANIZER") ? "PENDING" : "APPROVED";


        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword())
                .role(request.getRole().toUpperCase())
                .designation(request.getDesignation())
                .status(status)
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);


        return UserResponseDto.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .password(savedUser.getPassword()) // TODO: remove before production
                .role(savedUser.getRole())
                .designation(savedUser.getDesignation())
                .status(savedUser.getStatus())
                .createdAt(savedUser.getCreatedAt())
                .build();
    }

    // Get all users
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

    // Get user by ID
    public UserResponseDto getUserById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        return UserResponseDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .password(user.getPassword()) // TODO: remove before production
                .role(user.getRole())
                .designation(user.getDesignation())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
