package com.hackhub.service;

import com.hackhub.entities.*;
import com.hackhub.repository.*;
import com.hackhub.requestdto.TeamRequestDto;
import com.hackhub.responsedto.TeamMemberResponseDto;
import com.hackhub.responsedto.TeamResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final TeamRegistrationRepository teamRegistrationRepository;

    @Autowired
    public TeamService(TeamRepository teamRepository,
                       TeamMemberRepository teamMemberRepository,
                       UserRepository userRepository,
                       TeamRegistrationRepository teamRegistrationRepository) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
        this.teamRegistrationRepository = teamRegistrationRepository;
    }

    // Create Team
    public TeamResponseDto createTeam(TeamRequestDto request) {

        // Validate user exists and is PARTICIPANT
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));

        if (!"PARTICIPANT".equalsIgnoreCase(user.getRole()))
            throw new RuntimeException("Only PARTICIPANT can create a team");

        // Generate unique 6-char invite code
        String inviteCode = generateUniqueInviteCode();

        // Build and save team
        Team team = Team.builder()
                .name(request.getName())
                .leader(user)
                .inviteCode(inviteCode)
                .createdAt(LocalDateTime.now())
                .build();

        Team savedTeam = teamRepository.save(team);

        // Save creator as first TeamMember
        TeamMember teamMember = TeamMember.builder()
                .team(savedTeam)
                .user(user)
                .build();

        teamMemberRepository.save(teamMember);


        return mapToTeamResponse(savedTeam, 1);
    }

    // Get team by id
    public TeamResponseDto getTeamById(Integer teamId) {
        Team team = teamRepository.findByIdWithDetails(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found with id : " + teamId));

        int memberCount = teamMemberRepository.findByTeamId(teamId).size();
        return mapToTeamResponse(team, memberCount);
    }

    // Get all members of a team
    public List<TeamMemberResponseDto> getTeamMembers(Integer teamId) {
        Team team = teamRepository.findByIdWithDetails(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found with id : " + teamId));

        List<TeamMember> members = teamMemberRepository.findByTeamId(teamId);

        return members.stream()
                .map(member -> TeamMemberResponseDto.builder()
                        .userId(member.getUser().getId())
                        .name(member.getUser().getName())
                        .email(member.getUser().getEmail())
                        .isLeader(member.getUser().getId().equals(team.getLeader().getId()))
                        .build())
                .collect(Collectors.toList());
    }

    // Get all teams a user belongs to
    public List<TeamResponseDto> getTeamsByUser(Integer userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id : " + userId));

        List<TeamMember> memberships = teamMemberRepository.findByUserIdWithDetails(userId);

        return memberships.stream()
                .map(membership -> {
                    Team team = membership.getTeam();
                    int memberCount = teamMemberRepository.findByTeamId(team.getId()).size();
                    return mapToTeamResponse(team, memberCount);
                })
                .collect(Collectors.toList());
    }

    // Join Team via invite code
    public TeamResponseDto joinTeam(String inviteCode, Integer userId) {

        // 1. Validate invite code exists
        Team team = teamRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new RuntimeException("Invalid invite code"));

        // 2. Validate user exists and is PARTICIPANT
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (!"PARTICIPANT".equalsIgnoreCase(user.getRole()))
            throw new RuntimeException("Only PARTICIPANT can join a team");

        // 3. Check user not already a member of this team
        if (teamMemberRepository.existsByTeamIdAndUserId(team.getId(), userId))
            throw new RuntimeException("You are already a member of this team");

        // 4. Check if team is registered for any hackathon
        //    and if so, check user not already in another team for same hackathon
        List<TeamRegistration> registrations = teamRegistrationRepository.findByTeamId(team.getId());
        for (TeamRegistration registration : registrations) {
            if (teamRegistrationRepository.existsByUserIdAndHackathonId(
                    userId, registration.getHackathon().getId())) {
                throw new RuntimeException(
                        "You are already part of a team for hackathon: "
                                + registration.getHackathon().getTitle());
            }
        }

        // 5. Check team size against hackathon maxTeamSize
        Integer currentMemberCount = teamMemberRepository.countByTeamId(team.getId());
        for (TeamRegistration registration : registrations) {
            Hackathon hackathon = registration.getHackathon();
            if (hackathon.getMaxTeamSize() != null
                    && currentMemberCount >= hackathon.getMaxTeamSize()) {
                throw new RuntimeException(
                        "Team is full for hackathon: " + hackathon.getTitle());
            }
        }

        // 6. Add user as TeamMember
        TeamMember teamMember = TeamMember.builder()
                .team(team)
                .user(user)
                .build();

        teamMemberRepository.save(teamMember);

        return mapToTeamResponse(team, currentMemberCount + 1);
    }

    // Transfer Leadership
    public TeamResponseDto transferLeadership(Integer teamId,
                                              Integer currentLeaderId,
                                              Integer newLeaderId) {

        // Validate team exists
        Team team = teamRepository.findByIdWithDetails(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));

        // Validate requester is current leader
        if (!team.getLeader().getId().equals(currentLeaderId))
            throw new RuntimeException("Only the current leader can transfer leadership");

        // Validate new leader is a member of this team
        if (!teamMemberRepository.existsByTeamIdAndUserId(teamId, newLeaderId))
            throw new RuntimeException("New leader must be an existing member of the team");

        //  Update leader
        User newLeader = userRepository.findById(newLeaderId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + newLeaderId));

        team.setLeader(newLeader);
        Team updatedTeam = teamRepository.save(team);

        int memberCount = teamMemberRepository.findByTeamId(teamId).size();
        return mapToTeamResponse(updatedTeam, memberCount);
    }

    // Leave Team
    public void leaveTeam(Integer teamId, Integer userId) {

        // Validate team exists
        Team team = teamRepository.findByIdWithDetails(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));

        // Validate user is a member
        if (!teamMemberRepository.existsByTeamIdAndUserId(teamId, userId))
            throw new RuntimeException("You are not a member of this team");

        boolean isLeader = team.getLeader().getId().equals(userId);
        Integer memberCount = teamMemberRepository.countByTeamId(teamId);

        if (isLeader && memberCount == 1) {
            // Solo leader — auto delete team
            teamMemberRepository.deleteAll(teamMemberRepository.findByTeamId(teamId));
            teamRepository.delete(team);

        } else if (isLeader && memberCount > 1) {
            // Leader with members — block
            throw new RuntimeException("Transfer leadership to another member before leaving");

        } else {
            // Regular member — remove
            List<TeamMember> members = teamMemberRepository.findByTeamId(teamId);
            TeamMember memberToRemove = members.stream()
                    .filter(m -> m.getUser().getId().equals(userId))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Member not found"));
            teamMemberRepository.delete(memberToRemove);
        }
    }

    // Delete Team
    public void deleteTeam(Integer teamId, Integer userId) {

        // Validate team exists
        Team team = teamRepository.findByIdWithDetails(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));

        // Validate requester is the leader
        if (!team.getLeader().getId().equals(userId))
            throw new RuntimeException("Only the team leader can delete the team");

        // TODO: add TeamRegistration status check once Certificate module is built
        // if any registration is REGISTERED or COMPLETED → block deletion

        // Delete all TeamMember records then delete team
        List<TeamMember> members = teamMemberRepository.findByTeamId(teamId);
        teamMemberRepository.deleteAll(members);
        teamRepository.delete(team);
    }

    // Get team by invite code
    public TeamResponseDto getTeamByInviteCode(String inviteCode) {
        Team team = teamRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new RuntimeException("Invalid invite code"));

        int memberCount = teamMemberRepository.countByTeamId(team.getId());
        return mapToTeamResponse(team, memberCount);
    }

    // Search teams by name
    public List<TeamResponseDto> searchTeamsByName(String name) {
        if (name == null || name.trim().isEmpty())
            throw new RuntimeException("Search keyword cannot be empty");

        return teamRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(team -> {
                    int memberCount = teamMemberRepository.countByTeamId(team.getId());
                    return mapToTeamResponse(team, memberCount);
                })
                .collect(Collectors.toList());
    }

    // Get all teams — admin
    public List<TeamResponseDto> getAllTeams() {
        return teamRepository.findAll()
                .stream()
                .map(team -> {
                    int memberCount = teamMemberRepository.countByTeamId(team.getId());
                    return mapToTeamResponse(team, memberCount);
                })
                .collect(Collectors.toList()); //TODO: shift to the admin controller later
    }

    // Check if user is leader
    public boolean isUserLeader(Integer teamId, Integer userId) {
        Team team = teamRepository.findByIdWithDetails(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));

        return team.getLeader().getId().equals(userId);
    }

    private TeamResponseDto mapToTeamResponse(Team team, int memberCount) {
        return TeamResponseDto.builder()
                .id(team.getId())
                .name(team.getName())
                .leaderName(team.getLeader().getName())
                .inviteCode(team.getInviteCode())
                .memberCount(memberCount)
                .build();
    }

    private String generateUniqueInviteCode() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        String code;
        do {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 6; i++) {
                sb.append(characters.charAt(random.nextInt(characters.length())));
            }
            code = sb.toString();
        } while (teamRepository.findByInviteCode(code).isPresent());
        return code;
    }
}
