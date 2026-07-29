package com.hackhub.controller;

import com.hackhub.requestdto.TeamRequestDto;
import com.hackhub.responsedto.TeamMemberResponseDto;
import com.hackhub.responsedto.TeamResponseDto;
import com.hackhub.responsestatus.ResponseStatus;
import com.hackhub.service.TeamService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teams")
public class TeamController {

    private final TeamService teamService;

    @Autowired
    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    // Get team by id
    @PreAuthorize("hasRole('PARTICIPANT')")
    @GetMapping("/{teamId}")
    public ResponseEntity<ResponseStatus<TeamResponseDto>> getTeamById(@PathVariable Integer teamId) {
        TeamResponseDto response = teamService.getTeamById(teamId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Get team members
    @PreAuthorize("hasRole('PARTICIPANT')")
    @GetMapping("/{teamId}/members")
    public ResponseEntity<ResponseStatus<List<TeamMemberResponseDto>>> getTeamMembers(@PathVariable Integer teamId) {
        List<TeamMemberResponseDto> response = teamService.getTeamMembers(teamId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }


    // Get team by user id
    @PreAuthorize("hasRole('PARTICIPANT')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<ResponseStatus<List<TeamResponseDto>>> getTeamsByUser(@PathVariable Integer userId) {
        List<TeamResponseDto> response = teamService.getTeamsByUser(userId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Create team
    @PreAuthorize("hasRole('PARTICIPANT')")
    @PostMapping("/create")
    public ResponseEntity<ResponseStatus<TeamResponseDto>> createTeam(@RequestBody @Valid TeamRequestDto request) {
        TeamResponseDto response = teamService.createTeam(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ResponseStatus.success(response));
    }

    // Delete team
    @PreAuthorize("hasRole('PARTICIPANT')")
    @DeleteMapping("/{teamId}")
    public ResponseEntity<ResponseStatus<String>> deleteTeam(@PathVariable Integer teamId) {
        teamService.deleteTeam(teamId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success("Team deleted Successfully"));
    }

    // Join team
    @PreAuthorize("hasRole('PARTICIPANT')")
    @PostMapping("/join")
    public ResponseEntity<ResponseStatus<TeamResponseDto>> joinTeam(@RequestParam String code, @RequestParam Integer userId) {
        TeamResponseDto response = teamService.joinTeam(code);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Transfer leadership
    @PreAuthorize("hasRole('PARTICIPANT')")
    @PutMapping("/{teamId}/transfer-leader")
    public ResponseEntity<ResponseStatus<TeamResponseDto>> transferLeadership(@PathVariable Integer teamId, @RequestParam Integer newLeaderId) {
        TeamResponseDto response = teamService.transferLeadership(teamId, newLeaderId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Leave team
    @PreAuthorize("hasRole('PARTICIPANT')")
    @DeleteMapping("/{teamId}/leave")
    public ResponseEntity<ResponseStatus<String>> leaveTeam(@PathVariable Integer teamId) {
        teamService.leaveTeam(teamId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success("Successfully left the team"));
    }

    // Get team by invite code
    @PreAuthorize("hasRole('PARTICIPANT')")
    @GetMapping("/invite")
    public ResponseEntity<ResponseStatus<TeamResponseDto>> getTeamByInviteCode(@RequestParam String code) {
        TeamResponseDto response = teamService.getTeamByInviteCode(code);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Search teams by name
    @PreAuthorize("hasAnyRole('PARTICIPANT', 'ORGANIZER', 'JUDGE')")
    @GetMapping("/search")
    public ResponseEntity<ResponseStatus<List<TeamResponseDto>>> searchTeams(@RequestParam String name) {
        List<TeamResponseDto> response = teamService.searchTeamsByName(name);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Get all teams - ADMIN/ORGANIZER
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<ResponseStatus<List<TeamResponseDto>>> getAllTeams() {
        List<TeamResponseDto> response = teamService.getAllTeams();
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Check if user is leader
    @PreAuthorize("hasRole('PARTICIPANT')")
    @GetMapping("/{teamId}/is-leader")
    public ResponseEntity<ResponseStatus<Boolean>> isUserLeader(@PathVariable Integer teamId, @RequestParam Integer userId) {
        Boolean response = teamService.isUserLeader(teamId, userId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }
}
