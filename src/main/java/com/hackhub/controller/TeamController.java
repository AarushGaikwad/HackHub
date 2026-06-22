package com.hackhub.controller;

import com.hackhub.responsedto.TeamMemberResponseDto;
import com.hackhub.responsedto.TeamResponseDto;
import com.hackhub.responsestatus.ResponseStatus;
import com.hackhub.service.TeamService;
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

    // GET /api/teams/{teamId}
    @GetMapping("/{teamId}")
    public ResponseEntity<ResponseStatus<TeamResponseDto>> getTeamById(@PathVariable Integer teamId) {
        TeamResponseDto response = teamService.getTeamById(teamId);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ResponseStatus.success(response));
    }

    // GET /api/teams/{teamId}/members
    @GetMapping("/{teamId}/members")
    public ResponseEntity<ResponseStatus<List<TeamMemberResponseDto>>> getTeamMembers(@PathVariable Integer teamId) {
        List<TeamMemberResponseDto> response = teamService.getTeamMembers(teamId);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ResponseStatus.success(response));
    }

    // GET /api/teams/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<ResponseStatus<List<TeamResponseDto>>> getTeamsByUser(@PathVariable Integer userId) {
        List<TeamResponseDto> response = teamService.getTeamsByUser(userId);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ResponseStatus.success(response));
    }
}
