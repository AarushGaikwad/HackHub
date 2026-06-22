package com.hackhub.service;

import com.hackhub.entities.Team;
import com.hackhub.entities.TeamMember;
import com.hackhub.repository.TeamMemberRepository;
import com.hackhub.repository.TeamRepository;
import com.hackhub.repository.UserRepository;
import com.hackhub.responsedto.TeamMemberResponseDto;
import com.hackhub.responsedto.TeamResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;

    @Autowired
    public TeamService(TeamRepository teamRepository,
                       TeamMemberRepository teamMemberRepository,
                       UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
    }

    // API 1 — Get team by id
    public TeamResponseDto getTeamById(Integer teamId) {
        Team team = teamRepository.findByIdWithDetails(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found with id : " + teamId));

        int memberCount = teamMemberRepository.findByTeamId(teamId).size();

        return mapToTeamResponse(team, memberCount);
    }

    // API 2 — Get all members of a team
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

    // API 3 — Get all teams a user belongs to
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

    // Shared mapping — reused across API 1 and API 3
    private TeamResponseDto mapToTeamResponse(Team team, int memberCount) {
        return TeamResponseDto.builder()
                .id(team.getId())
                .name(team.getName())
                .hackathonTitle(team.getHackathon().getTitle())
                .leaderName(team.getLeader().getName())
                .inviteCode(team.getInviteCode())
                .memberCount(memberCount)
                .build();
    }
}
