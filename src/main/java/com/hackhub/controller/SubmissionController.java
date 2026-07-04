package com.hackhub.controller;

import com.hackhub.requestdto.submissionrequestdto.FinalSubmissionRequestDto;
import com.hackhub.requestdto.submissionrequestdto.ProgressSubmissionRequestDto;
import com.hackhub.responsedto.SubmissionResponseDto;
import com.hackhub.responsestatus.ResponseStatus;
import com.hackhub.service.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/submission")
public class SubmissionController {

    private final SubmissionService submissionService;

    @Autowired
    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    // Submit progress update
    @PostMapping("/progress")
    public ResponseEntity<ResponseStatus<SubmissionResponseDto>> submitProgress(@RequestBody @Valid ProgressSubmissionRequestDto request) {
        SubmissionResponseDto response = submissionService.submitProgress(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ResponseStatus.success(response));
    }

    // Submit final submission
    @PostMapping("/final")
    public ResponseEntity<ResponseStatus<SubmissionResponseDto>> submitFinal(@RequestBody @Valid FinalSubmissionRequestDto request) {
        SubmissionResponseDto response = submissionService.submitFinal(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ResponseStatus.success(response));
    }

    // Edit progress submission
    @PutMapping("/progress/{submissionId}")
    public ResponseEntity<ResponseStatus<SubmissionResponseDto>> editProgressSubmission(@PathVariable Integer submissionId, @RequestParam Integer userId, @RequestBody @Valid ProgressSubmissionRequestDto request) {
        SubmissionResponseDto response = submissionService.editProgressSubmission(submissionId, userId, request);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Delete progress submission
    @DeleteMapping("/progress/{submissionId}")
    public ResponseEntity<ResponseStatus<String>> deleteProgressSubmission(@PathVariable Integer submissionId, @RequestParam Integer userId) {
        submissionService.deleteProgressSubmission(submissionId, userId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success("Submission deleted successfully"));
    }

    // Get submission by id
    @GetMapping("/{submissionId}")
    public ResponseEntity<ResponseStatus<SubmissionResponseDto>> getSubmissionById(@PathVariable Integer submissionId) {
        SubmissionResponseDto response = submissionService.getSubmissionById(submissionId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Get final submission by team registration
    @GetMapping("/final/{teamRegistrationId}")
    public ResponseEntity<ResponseStatus<SubmissionResponseDto>> getFinalSubmission(@PathVariable Integer teamRegistrationId) {
        SubmissionResponseDto response = submissionService.getFinalSubmission(teamRegistrationId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Get all submissions for a team registration
    @GetMapping("/team/{teamRegistrationId}")
    public ResponseEntity<ResponseStatus<List<SubmissionResponseDto>>> getTeamSubmissions(@PathVariable Integer teamRegistrationId) {
        List<SubmissionResponseDto> response = submissionService.getTeamSubmissions(teamRegistrationId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Get all submissions for a hackathon
    @GetMapping("/hackathon/{hackathonId}")
    public ResponseEntity<ResponseStatus<List<SubmissionResponseDto>>> getHackathonSubmissions(@PathVariable Integer hackathonId) {
        List<SubmissionResponseDto> response = submissionService.getHackathonSubmissions(hackathonId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Get all submissions by a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<ResponseStatus<List<SubmissionResponseDto>>> getUserSubmissions(@PathVariable Integer userId) {
        List<SubmissionResponseDto> response = submissionService.getUserSubmissions(userId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Get only final submissions for a hackathon
    @GetMapping("/hackathon/{hackathonId}/final")
    public ResponseEntity<ResponseStatus<List<SubmissionResponseDto>>> getHackathonFinalSubmissions(@PathVariable Integer hackathonId) {
        List<SubmissionResponseDto> response = submissionService.getHackathonFinalSubmissions(hackathonId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Get only progress submissions for a team registration
    @GetMapping("/team/{teamRegistrationId}/progress")
    public ResponseEntity<ResponseStatus<List<SubmissionResponseDto>>> getTeamProgressSubmissions(@PathVariable Integer teamRegistrationId) {
        List<SubmissionResponseDto> response = submissionService.getTeamProgressSubmissions(teamRegistrationId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }
}
