package com.hackhub.service;

import com.hackhub.entities.*;
import com.hackhub.repository.SubmissionRepository;
import com.hackhub.repository.TeamMemberRepository;
import com.hackhub.repository.TeamRegistrationRepository;
import com.hackhub.repository.UserRepository;
import com.hackhub.requestdto.submissionrequestdto.FinalSubmissionRequestDto;
import com.hackhub.requestdto.submissionrequestdto.ProgressSubmissionRequestDto;
import com.hackhub.responsedto.SubmissionResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final TeamRegistrationRepository teamRegistrationRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;

    @Autowired
    public SubmissionService(SubmissionRepository submissionRepository,
                             TeamRegistrationRepository teamRegistrationRepository,
                             TeamMemberRepository teamMemberRepository,
                             UserRepository userRepository) {
        this.submissionRepository = submissionRepository;
        this.teamRegistrationRepository = teamRegistrationRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
    }

    // Submit Progress Update
    public SubmissionResponseDto submitProgress(ProgressSubmissionRequestDto request) {

        // 1. Validate team registration exists
        TeamRegistration teamRegistration = teamRegistrationRepository
                .findById(request.getTeamRegistrationId())
                .orElseThrow(() -> new RuntimeException("Team registration not found"));

        // Validate hackathon is ACTIVE
        Hackathon hackathon = teamRegistration.getHackathon();
        LocalDateTime now = LocalDateTime.now();
        if (hackathon.getStartDate().isAfter(now))
            throw new RuntimeException("Hackathon has not started yet");
        if (hackathon.getEndDate().isBefore(now))
            throw new RuntimeException("Hackathon has already ended");

        // Validate user exists
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));

        // Validate user is a member of the team
        if (!teamMemberRepository.existsByTeamIdAndUserId(
                teamRegistration.getTeam().getId(), request.getUserId()))
            throw new RuntimeException("You are not a member of this team");

        // Check if FINAL submission already exists — block progress after final
        if (submissionRepository.existsByTeamRegistrationIdAndStatus(
                request.getTeamRegistrationId(), "FINAL"))
            throw new RuntimeException("Final submission already exists — no more progress updates allowed");


        Submission submission = Submission.builder()
                .teamRegistration(teamRegistration)
                .submittedBy(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .resourceUrl(request.getResourceUrl())
                .githubUrl(request.getGithubUrl())
                .status("PROGRESS")
                .submittedAt(LocalDateTime.now())
                .build();

        Submission saved = submissionRepository.save(submission);
        return mapToResponse(saved);
    }

    // Submit Final Submission
    public SubmissionResponseDto submitFinal(FinalSubmissionRequestDto request) {

        // Validate team registration exists
        TeamRegistration teamRegistration = teamRegistrationRepository
                .findById(request.getTeamRegistrationId())
                .orElseThrow(() -> new RuntimeException("Team registration not found"));

        // Validate hackathon is ACTIVE
        Hackathon hackathon = teamRegistration.getHackathon();
        LocalDateTime now = LocalDateTime.now();
        if (hackathon.getStartDate().isAfter(now))
            throw new RuntimeException("Hackathon has not started yet");
        if (hackathon.getEndDate().isBefore(now))
            throw new RuntimeException("Hackathon has already ended");

        // Validate user exists
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));

        // Validate user is team leader
        Team team = teamRegistration.getTeam();
        if (!team.getLeader().getId().equals(request.getUserId()))
            throw new RuntimeException("Only team leader can make final submission");

        // Check if FINAL submission already exists
        if (submissionRepository.existsByTeamRegistrationIdAndStatus(
                request.getTeamRegistrationId(), "FINAL"))
            throw new RuntimeException("Final submission already exists for this hackathon");


        Submission submission = Submission.builder()
                .teamRegistration(teamRegistration)
                .submittedBy(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .githubUrl(request.getGithubUrl())
                .resourceUrl(request.getResourceUrl())
                .status("FINAL")
                .submittedAt(LocalDateTime.now())
                .build();

        Submission saved = submissionRepository.save(submission);
        return mapToResponse(saved);
    }

    // Edit Progress Submission
    public SubmissionResponseDto editProgressSubmission(Integer submissionId,
                                                        Integer userId,
                                                        ProgressSubmissionRequestDto request) {

        // Validate submission exists
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found with id: " + submissionId));

        // Block if FINAL submission
        if ("FINAL".equalsIgnoreCase(submission.getStatus()))
            throw new RuntimeException("Final submission cannot be edited");

        // Validate hackathon is ACTIVE
        Hackathon hackathon = submission.getTeamRegistration().getHackathon();
        LocalDateTime now = LocalDateTime.now();
        if (hackathon.getEndDate().isBefore(now))
            throw new RuntimeException("Cannot edit submission after hackathon has ended");

        // Validate user is submitter or leader
        Team team = submission.getTeamRegistration().getTeam();
        boolean isSubmitter = submission.getSubmittedBy().getId().equals(userId);
        boolean isLeader = team.getLeader().getId().equals(userId);

        if (!isSubmitter && !isLeader)
            throw new RuntimeException("Only the submitter or team leader can edit this submission");

        // Update fields
        submission.setTitle(request.getTitle());
        submission.setDescription(request.getDescription());
        submission.setResourceUrl(request.getResourceUrl());
        if (request.getGithubUrl() != null)
            submission.setGithubUrl(request.getGithubUrl());

        Submission updated = submissionRepository.save(submission);
        return mapToResponse(updated);
    }

    // Delete Progress Submission
    public void deleteProgressSubmission(Integer submissionId, Integer userId) {

        // Validate submission exists
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found with id: " + submissionId));

        // Block if FINAL submission
        if ("FINAL".equalsIgnoreCase(submission.getStatus()))
            throw new RuntimeException("Final submission cannot be deleted");

        // Validate hackathon is ACTIVE
        Hackathon hackathon = submission.getTeamRegistration().getHackathon();
        if (hackathon.getEndDate().isBefore(LocalDateTime.now()))
            throw new RuntimeException("Cannot delete submission after hackathon has ended");

        // Validate user is submitter or leader
        Team team = submission.getTeamRegistration().getTeam();
        boolean isSubmitter = submission.getSubmittedBy().getId().equals(userId);
        boolean isLeader = team.getLeader().getId().equals(userId);

        if (!isSubmitter && !isLeader)
            throw new RuntimeException("Only the submitter or team leader can delete this submission");

        submissionRepository.delete(submission);
    }

    // Get submission by id
    public SubmissionResponseDto getSubmissionById(Integer submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found with id: " + submissionId));
        return mapToResponse(submission);
    }

    // Get final submission by team registration
    public SubmissionResponseDto getFinalSubmission(Integer teamRegistrationId) {
        Submission submission = submissionRepository
                .findByTeamRegistrationIdAndStatus(teamRegistrationId, "FINAL")
                .orElseThrow(() -> new RuntimeException("No final submission found for this team"));
        return mapToResponse(submission);
    }

    // Get all submissions for a team registration
    public List<SubmissionResponseDto> getTeamSubmissions(Integer teamRegistrationId) {
        teamRegistrationRepository.findById(teamRegistrationId)
                .orElseThrow(() -> new RuntimeException("Team registration not found"));

        return submissionRepository.findByTeamRegistrationId(teamRegistrationId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get all submissions for a hackathon
    public List<SubmissionResponseDto> getHackathonSubmissions(Integer hackathonId) {
        return submissionRepository.findByHackathonId(hackathonId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get all submissions by a user
    public List<SubmissionResponseDto> getUserSubmissions(Integer userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        return submissionRepository.findBySubmittedById(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get only final submissions for a hackathon
    public List<SubmissionResponseDto> getHackathonFinalSubmissions(Integer hackathonId) {
        return submissionRepository.findFinalSubmissionsByHackathonId(hackathonId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get only progress submissions for a team registration
    public List<SubmissionResponseDto> getTeamProgressSubmissions(Integer teamRegistrationId) {
        teamRegistrationRepository.findById(teamRegistrationId)
                .orElseThrow(() -> new RuntimeException("Team registration not found"));

        return submissionRepository
                .findByTeamRegistrationIdAndStatus(teamRegistrationId, "PROGRESS")
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Private helper
    private SubmissionResponseDto mapToResponse(Submission submission) {
        return SubmissionResponseDto.builder()
                .id(submission.getId())
                .teamRegistrationId(submission.getTeamRegistration().getId())
                .teamName(submission.getTeamRegistration().getTeam().getName())
                .hackathonTitle(submission.getTeamRegistration().getHackathon().getTitle())
                .submittedByName(submission.getSubmittedBy().getName())
                .title(submission.getTitle())
                .description(submission.getDescription())
                .githubUrl(submission.getGithubUrl())
                .resourceUrl(submission.getResourceUrl())
                .status(submission.getStatus())
                .submittedAt(submission.getSubmittedAt())
                .updatedAt(submission.getUpdatedAt())
                .build();
    }
}
