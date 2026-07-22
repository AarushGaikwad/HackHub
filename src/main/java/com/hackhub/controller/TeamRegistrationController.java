package com.hackhub.controller;

import com.hackhub.responsedto.TeamRegistrationResponseDto;
import com.hackhub.responsestatus.ResponseStatus;
import com.hackhub.service.TeamRegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hackathon")
public class TeamRegistrationController {

    private final TeamRegistrationService teamRegistrationService;

    @Autowired
    public TeamRegistrationController(TeamRegistrationService teamRegistrationService) {
        this.teamRegistrationService = teamRegistrationService;
    }

    // Register team for hackathon
    @PreAuthorize("hasRole('PARTICIPANT')")
    @PostMapping("/{hackathonId}/register-team/{teamId}")
    public ResponseEntity<ResponseStatus<TeamRegistrationResponseDto>> registerTeam(@PathVariable Integer hackathonId, @PathVariable Integer teamId) {
        TeamRegistrationResponseDto response = teamRegistrationService.registerTeam(hackathonId, teamId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ResponseStatus.success(response));
    }

    // Get registered team for hackathon
    @PreAuthorize("hasRole('ORGANIZER')")
    @GetMapping("/{hackathonId}/registered-teams")
    public ResponseEntity<ResponseStatus<List<TeamRegistrationResponseDto>>> getRegisteredTeams(
            @PathVariable Integer hackathonId) {
        List<TeamRegistrationResponseDto> response = teamRegistrationService.getRegisteredTeams(hackathonId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Withdraw team from hackathon
    @PreAuthorize("hasRole('PARTICIPANT')")
    @DeleteMapping("/{hackathonId}/register-team/{teamId}")
    public ResponseEntity<ResponseStatus<String>> withdrawTeam(@PathVariable Integer hackathonId, @PathVariable Integer teamId) {
        teamRegistrationService.withdrawTeam(hackathonId, teamId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success("Team registration withdrawn successfully"));
    }

    // Get all hackathon a team is registered for
    @PreAuthorize("hasRole('PARTICIPANT')")
    @GetMapping("/team/{teamId}/registrations")
    public ResponseEntity<ResponseStatus<List<TeamRegistrationResponseDto>>> getHackathonsByTeam(
            @PathVariable Integer teamId) {
        List<TeamRegistrationResponseDto> response = teamRegistrationService.getHackathonsByTeam(teamId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Update registration status
    @PreAuthorize("hasRole('PARTICIPANT')")
    @PutMapping("/{hackathonId}/register-team/{teamId}/status")
    public ResponseEntity<ResponseStatus<TeamRegistrationResponseDto>> updateRegistrationStatus(
            @PathVariable Integer hackathonId, @PathVariable Integer teamId,
            @RequestParam Integer userId, @RequestParam String status) {
        TeamRegistrationResponseDto response = teamRegistrationService.updateRegistrationStatus(hackathonId, teamId, userId, status);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Get user's participated hackathons
    @PreAuthorize("hasRole('PARTICIPANT')")
    @GetMapping("/user/{userId}/hackathons")
    public ResponseEntity<ResponseStatus<List<TeamRegistrationResponseDto>>>
    getUserParticipatedHackathons(@PathVariable Integer userId) {
        List<TeamRegistrationResponseDto> response = teamRegistrationService.getUserParticipatedHackathons(userId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }
}
