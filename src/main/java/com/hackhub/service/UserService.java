package com.hackhub.service;

import com.hackhub.entities.Organization;
import com.hackhub.entities.User;
import com.hackhub.repository.OrganizationRepository;
import com.hackhub.repository.UserRepository;
import com.hackhub.requestdto.JudgeRequestDto;
import com.hackhub.requestdto.OrganizerRequestDto;
import com.hackhub.requestdto.ParticipantRequestDto;
import com.hackhub.requestdto.UserRequestDto;
import com.hackhub.responsedto.JudgeResponseDto;
import com.hackhub.responsedto.OrganizerResponseDto;
import com.hackhub.responsedto.ParticipantResponseDto;
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
    private final OrganizationRepository organizationRepository;

    @Autowired
    public UserService(OrganizationRepository organizationRepository, UserRepository userRepository) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
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
                .password(request.getPassword())
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
                .password(request.getPassword())
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
                .password(request.getPassword())
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
                .collect(Collectors.toList()); //TODO: add this method in the admin service
    }
}
