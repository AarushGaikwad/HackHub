package com.hackhub.service;

import com.hackhub.entities.*;
import com.hackhub.repository.*;
import com.hackhub.responsedto.TeamRegistrationResponseDto;
import com.hackhub.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeamRegistrationService {

    private final TeamRegistrationRepository teamRegistrationRepository;
    private final TeamRepository teamRepository;
    private final HackathonRepository hackathonRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;

    @Autowired
    public TeamRegistrationService(TeamRegistrationRepository teamRegistrationRepository,
                                   TeamRepository teamRepository,
                                   HackathonRepository hackathonRepository,
                                   TeamMemberRepository teamMemberRepository,
                                   UserRepository userRepository, SecurityUtils securityUtils) {
        this.teamRegistrationRepository = teamRegistrationRepository;
        this.teamRepository = teamRepository;
        this.hackathonRepository = hackathonRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
        this.securityUtils = securityUtils;
    }

    // Register team for hackathon
    public TeamRegistrationResponseDto registerTeam(Integer hackathonId, Integer teamId) {

        Integer userId = securityUtils.getCurrentUserId();

        // Validate hackathon exists
        Hackathon hackathon = hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found with id: " + hackathonId));

        // Validate team exists
        Team team = teamRepository.findByIdWithDetails(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));

        // Validate requester is team leader
        if (!team.getLeader().getId().equals(userId))
            throw new RuntimeException("Only team leader can register the team for a hackathon");

        // Check registration deadline
        LocalDateTime deadline = hackathon.getRegistrationDeadline() != null
                ? hackathon.getRegistrationDeadline()
                : hackathon.getStartDate().minusDays(1);

        if (LocalDateTime.now().isAfter(deadline))
            throw new RuntimeException("Registration deadline has passed for this hackathon");

        // Check hackathon is not COMPLETED
        if (hackathon.getEndDate().isBefore(LocalDateTime.now()))
            throw new RuntimeException("Cannot register for a completed hackathon");

        // Check team not already registered for this hackathon
        if (teamRegistrationRepository.existsByTeamIdAndHackathonId(teamId, hackathonId))
            throw new RuntimeException("Team is already registered for this hackathon");

        // Check team size against hackathon maxTeamSize
        Integer memberCount = teamMemberRepository.countByTeamId(teamId);
        if (hackathon.getMaxTeamSize() != null && memberCount > hackathon.getMaxTeamSize())
            throw new RuntimeException("Team size exceeds hackathon limit of " + hackathon.getMaxTeamSize());

        // Get registeredBy user
        User registeredBy = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Save registration
        TeamRegistration registration = TeamRegistration.builder()
                .team(team)
                .hackathon(hackathon)
                .status("REGISTERED")
                .registeredBy(registeredBy)
                .registeredAt(LocalDateTime.now())
                .build();

        TeamRegistration saved = teamRegistrationRepository.save(registration);

        return mapToResponse(saved, memberCount);
    }

    // Get all teams registered for a hackathon
    public List<TeamRegistrationResponseDto> getRegisteredTeams(Integer hackathonId) {

        hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found with id: " + hackathonId));

        return teamRegistrationRepository.findByHackathonIdWithDetails(hackathonId)
                .stream()
                .map(tr -> {
                    Integer memberCount = teamMemberRepository.countByTeamId(tr.getTeam().getId());
                    return mapToResponse(tr, memberCount);
                })
                .collect(Collectors.toList());
    }

    // Withdraw team from hackathon
    public void withdrawTeam(Integer hackathonId, Integer teamId) {

        Integer userId = securityUtils.getCurrentUserId();

        // Validate registration exists
        TeamRegistration registration = teamRegistrationRepository
                .findByTeamIdAndHackathonId(teamId, hackathonId)
                .orElseThrow(() -> new RuntimeException("Team is not registered for this hackathon"));

        // Validate user — must be team leader OR organizer
        Team team = teamRepository.findByIdWithDetails(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        boolean isLeader = team.getLeader().getId().equals(userId);
        boolean isOrganizer = "ORGANIZER".equalsIgnoreCase(user.getRole());

        if (!isLeader && !isOrganizer)
            throw new RuntimeException("Only team leader or organizer can withdraw a team");

        // Block if hackathon already started
        if (registration.getHackathon().getStartDate().isBefore(LocalDateTime.now()))
            throw new RuntimeException("Cannot withdraw after hackathon has started");

        // Delete registration
        teamRegistrationRepository.delete(registration);
    }

    // Get all hackathons a team is registered for
    public List<TeamRegistrationResponseDto> getHackathonsByTeam(Integer teamId) {

        teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));

        return teamRegistrationRepository.findByTeamIdWithDetails(teamId)
                .stream()
                .map(tr -> {
                    Integer memberCount = teamMemberRepository.countByTeamId(tr.getTeam().getId());
                    return mapToResponse(tr, memberCount);
                })
                .collect(Collectors.toList());
    }

    // Update registration status — organizer only
    public TeamRegistrationResponseDto updateRegistrationStatus(Integer hackathonId,
                                                                Integer teamId,
                                                                String status) {

        Integer userId = securityUtils.getCurrentUserId();

        // Validate registration exists
        TeamRegistration registration = teamRegistrationRepository
                .findByTeamIdAndHackathonId(teamId, hackathonId)
                .orElseThrow(() -> new RuntimeException("Team is not registered for this hackathon"));

        // Validate user is organizer
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (!"ORGANIZER".equalsIgnoreCase(user.getRole()))
            throw new RuntimeException("Only organizer can update registration status");

        // Validate status value
        List<String> validStatuses = Arrays.asList("REGISTERED", "COMPLETED", "CLOSED");
        if (!validStatuses.contains(status.toUpperCase()))
            throw new RuntimeException("Invalid status. Allowed: REGISTERED, COMPLETED, CLOSED");

        // Update status
        registration.setStatus(status.toUpperCase());
        TeamRegistration updated = teamRegistrationRepository.save(registration);

        Integer memberCount = teamMemberRepository.countByTeamId(teamId);
        return mapToResponse(updated, memberCount);
    }

    // Get user's participated hackathons
    public List<TeamRegistrationResponseDto> getUserParticipatedHackathons(Integer userId) {

        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Find all teams user is member of
        List<TeamMember> memberships = teamMemberRepository.findByUserId(userId);

        // For each team find all registrations
        return memberships.stream()
                .flatMap(membership ->
                        teamRegistrationRepository
                                .findByTeamIdWithDetails(membership.getTeam().getId())
                                .stream())
                .map(tr -> {
                    Integer memberCount = teamMemberRepository.countByTeamId(tr.getTeam().getId());
                    return mapToResponse(tr, memberCount);
                })
                .collect(Collectors.toList());
    }

    private TeamRegistrationResponseDto mapToResponse(TeamRegistration teamRegistration, Integer memberCount) {
        return TeamRegistrationResponseDto.builder()
                .id(teamRegistration.getId())
                .teamId(teamRegistration.getTeam().getId())
                .teamName(teamRegistration.getTeam().getName())
                .hackathonId(teamRegistration.getHackathon().getId())
                .hackathonTitle(teamRegistration.getHackathon().getTitle())
                .leaderName(teamRegistration.getTeam().getLeader().getName())
                .memberCount(memberCount)
                .status(teamRegistration.getStatus())
                .registeredBy(teamRegistration.getRegisteredBy() != null
                        ? teamRegistration.getRegisteredBy().getName() : null)
                .registeredAt(teamRegistration.getRegisteredAt())
                .build();
    }
}
