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


    @GetMapping("/{teamId}")
    public ResponseEntity<ResponseStatus<TeamResponseDto>> getTeamById(@PathVariable Integer teamId) {
        TeamResponseDto response = teamService.getTeamById(teamId);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ResponseStatus.success(response));
    }

    @GetMapping("/{teamId}/members")
    public ResponseEntity<ResponseStatus<List<TeamMemberResponseDto>>> getTeamMembers(@PathVariable Integer teamId) {
        List<TeamMemberResponseDto> response = teamService.getTeamMembers(teamId);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ResponseStatus.success(response));
    }


    @GetMapping("/user/{userId}")
    public ResponseEntity<ResponseStatus<List<TeamResponseDto>>> getTeamsByUser(@PathVariable Integer userId) {
        List<TeamResponseDto> response = teamService.getTeamsByUser(userId);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ResponseStatus.success(response));
    }

    @PostMapping("/create")
    public ResponseEntity<ResponseStatus<TeamResponseDto>> createTeam(@RequestBody @Valid TeamRequestDto request) {
        TeamResponseDto response = teamService.createTeam(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ResponseStatus.success(response));
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<ResponseStatus<String>> deleteTeam (@PathVariable Integer teamId, @RequestParam Integer userId) {
        teamService.deleteTeam(teamId, userId);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ResponseStatus.success("Team deleted Successfully"));
    }

    @PostMapping("/join")
    public ResponseEntity<ResponseStatus<TeamResponseDto>> joinTeam(@RequestParam String code, @RequestParam Integer userId) {
        TeamResponseDto response = teamService.joinTeam(code, userId);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ResponseStatus.success(response));
    }

    @PutMapping("/{teamId}/transfer-leader")
    public ResponseEntity<ResponseStatus<TeamResponseDto>> transferLeadership(
            @PathVariable Integer teamId, @RequestParam Integer currentLeaderId, @RequestParam Integer newLeaderId) {
        TeamResponseDto response = teamService.transferLeadership(teamId, currentLeaderId, newLeaderId);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ResponseStatus.success(response));
    }

    @DeleteMapping("/{teamId}/leave")
    public ResponseEntity<ResponseStatus<String>> leaveTeam(@PathVariable Integer teamId, @RequestParam Integer userId) {
        teamService.leaveTeam(teamId, userId);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ResponseStatus.success("Successfully left the team"));
    }

    // Get team by invite code
    @GetMapping("/invite")
    public ResponseEntity<ResponseStatus<TeamResponseDto>> getTeamByInviteCode(
            @RequestParam String code) {
        TeamResponseDto response = teamService.getTeamByInviteCode(code);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ResponseStatus.success(response));
    }

    // Search teams by name
    @GetMapping("/search")
    public ResponseEntity<ResponseStatus<List<TeamResponseDto>>> searchTeams(
            @RequestParam String name) {
        List<TeamResponseDto> response = teamService.searchTeamsByName(name);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ResponseStatus.success(response));
    }

    // Get all teams - ADMIN/ORGANIZER
    @GetMapping
    public ResponseEntity<ResponseStatus<List<TeamResponseDto>>> getAllTeams() {
        List<TeamResponseDto> response = teamService.getAllTeams();
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ResponseStatus.success(response));
    }

    // Check if user is leader
    @GetMapping("/{teamId}/is-leader")
    public ResponseEntity<ResponseStatus<Boolean>> isUserLeader(
            @PathVariable Integer teamId,
            @RequestParam Integer userId) {
        Boolean response = teamService.isUserLeader(teamId, userId);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ResponseStatus.success(response));
    }
}
