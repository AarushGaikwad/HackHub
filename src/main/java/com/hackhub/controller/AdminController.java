package com.hackhub.controller;

import com.hackhub.responsedto.AdminStatsResponseDto;
import com.hackhub.responsedto.CertificateResponseDto;
import com.hackhub.responsedto.HackathonResponseDto;
import com.hackhub.responsedto.UserResponseDto;
import com.hackhub.responsestatus.ResponseStatus;
import com.hackhub.service.AdminService;
import com.hackhub.service.CertificateService;
import com.hackhub.service.HackathonService;
import com.hackhub.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UserService userService;
    private final HackathonService hackathonService;
    private final CertificateService certificateService;
    private final AdminService adminService;

    @Autowired
    public AdminController(UserService userService,
                           HackathonService hackathonService,
                           CertificateService certificateService,
                           AdminService adminService) {
        this.userService = userService;
        this.hackathonService = hackathonService;
        this.certificateService = certificateService;
        this.adminService = adminService;
    }

    // ─── User Management ─────────────────────────────────────────────────────

    // Get all users
    @GetMapping("/users")
    public ResponseEntity<ResponseStatus<List<UserResponseDto>>> getAllUsers() {
        List<UserResponseDto> response = userService.getAllUsers();
        return ResponseEntity.ok(ResponseStatus.success(response));
    }

    // Get user by id
    @GetMapping("/users/{userId}")
    public ResponseEntity<ResponseStatus<UserResponseDto>> getUserById(
            @PathVariable Integer userId) {
        UserResponseDto response = userService.getUserById(userId);
        return ResponseEntity.ok(ResponseStatus.success(response));
    }

    // Get user by role
    @GetMapping("/users/role/{role}")
    public ResponseEntity<ResponseStatus<List<UserResponseDto>>> getUsersByRole(
            @PathVariable String role) {
        List<UserResponseDto> response = userService.getUsersByRole(role);
        return ResponseEntity.ok(ResponseStatus.success(response));
    }

    // Approve organizer
    @PutMapping("/users/{userId}/approve")
    public ResponseEntity<ResponseStatus<UserResponseDto>> approveOrganizer(
            @PathVariable Integer userId) {
        UserResponseDto response = userService.approveOrganizer(userId);
        return ResponseEntity.ok(ResponseStatus.success(response));
    }

    // Reject organizer
    @PutMapping("/users/{userId}/reject")
    public ResponseEntity<ResponseStatus<UserResponseDto>> rejectOrganizer(
            @PathVariable Integer userId) {
        UserResponseDto response = userService.rejectOrganizer(userId);
        return ResponseEntity.ok(ResponseStatus.success(response));
    }

    // ─── Hackathon Management ─────────────────────────────────────────────────

    // Get all hackathons
    @GetMapping("/hackathons")
    public ResponseEntity<ResponseStatus<List<HackathonResponseDto>>> getAllHackathons() {
        List<HackathonResponseDto> response = hackathonService.getAllHackathons();
        return ResponseEntity.ok(ResponseStatus.success(response));
    }

    // Delete hackathon
    @DeleteMapping("/hackathons/{hackathonId}")
    public ResponseEntity<ResponseStatus<String>> deleteHackathon(
            @PathVariable Integer hackathonId) {
        hackathonService.deleteHackathon(hackathonId);
        return ResponseEntity.ok(ResponseStatus.success("Hackathon deleted successfully"));
    }

    // ─── Certificate Management ───────────────────────────────────────────────

    // Get all certificates
    @GetMapping("/certificates")
    public ResponseEntity<ResponseStatus<List<CertificateResponseDto>>> getAllCertificates() {
        List<CertificateResponseDto> response = certificateService.getAllCertificates();
        return ResponseEntity.ok(ResponseStatus.success(response));
    }

    // ─── Platform Stats ───────────────────────────────────────────────────────

    // Platform status (dashboard api)
    @GetMapping("/stats/overview")
    public ResponseEntity<ResponseStatus<AdminStatsResponseDto>> getOverviewStats() {
        AdminStatsResponseDto response = adminService.getOverviewStats();
        return ResponseEntity.ok(ResponseStatus.success(response));
    }
}
