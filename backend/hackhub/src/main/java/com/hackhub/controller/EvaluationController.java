package com.hackhub.controller;

import com.hackhub.requestdto.EvaluationRequestDto;
import com.hackhub.responsedto.*;
import com.hackhub.responsestatus.ResponseStatus;
import com.hackhub.service.EvaluationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class EvaluationController {

    private final EvaluationService evaluationService;

    @Autowired
    public EvaluationController(EvaluationService evaluationService) {
        this.evaluationService = evaluationService;
    }

    // ─── Judge Assignment APIs ────────────────────────────────────────────────

    // Assign judge to a hackathon
    @PreAuthorize("hasRole('ORGANIZER')")
    @PostMapping("/hackathon/{hackathonId}/assign-judge/{judgeId}")
    public ResponseEntity<ResponseStatus<JudgeAssignmentResponseDto>> assignJudge(@PathVariable Integer hackathonId,
                                                                                  @PathVariable Integer judgeId,
                                                                                  @RequestParam Integer organizerId) {
        JudgeAssignmentResponseDto response = evaluationService.assignJudge(hackathonId, judgeId, organizerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ResponseStatus.success(response));
    }

    // Remove assign judge to a hackathon -> status = INACTIVE
    @PreAuthorize("hasRole('ORGANIZER')")
    @DeleteMapping("/hackathon/{hackathonId}/assign-judge/{judgeId}")
    public ResponseEntity<ResponseStatus<String>> removeJudge(@PathVariable Integer hackathonId,
                                                              @PathVariable Integer judgeId,
                                                              @RequestParam Integer organizerId) {
        evaluationService.removeJudge(hackathonId, judgeId, organizerId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success("Judge removed successfully"));
    }

    // Get assigned judge for a hackathon
    @PreAuthorize("hasRole('ORGANIZER')")
    @GetMapping("/hackathon/{hackathonId}/judges")
    public ResponseEntity<ResponseStatus<List<JudgeAssignmentResponseDto>>> getAssignedJudges(@PathVariable Integer hackathonId) {
        List<JudgeAssignmentResponseDto> response = evaluationService.getAssignedJudges(hackathonId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Get assigned hackathon to a judge
    @PreAuthorize("hasRole('ORGANIZER')")
    @GetMapping("judges/{judgeId}/hackathons")
    public ResponseEntity<ResponseStatus<List<JudgeAssignmentResponseDto>>> getJudgeHackathons(@PathVariable Integer judgeId) {
        List<JudgeAssignmentResponseDto> response = evaluationService.getJudgeHackathons(judgeId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // ─── Evaluation APIs ──────────────────────────────────────────────────────

    // Submit evaluation
    @PreAuthorize("hasRole('JUDGE')")
    @PostMapping("/evaluations")
    public ResponseEntity<ResponseStatus<EvaluationResponseDto>> submitEvaluation(@RequestBody @Valid EvaluationRequestDto request) {
        EvaluationResponseDto response = evaluationService.submitEvaluation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ResponseStatus.success(response));
    }

    // Update evaluation
    @PreAuthorize("hasRole('JUDGE')")
    @PutMapping("/evaluations/{evaluationId}")
    public ResponseEntity<ResponseStatus<EvaluationResponseDto>> updateEvaluation(@PathVariable Integer evaluationId,
                                                                                  @RequestBody @Valid EvaluationRequestDto request) {
        EvaluationResponseDto response = evaluationService.updateEvaluation(evaluationId, request);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @GetMapping("/evaluations/{evaluationId}")
    public ResponseEntity<ResponseStatus<EvaluationResponseDto>> getEvaluationById(@PathVariable Integer evaluationId) {
        EvaluationResponseDto response = evaluationService.getEvaluationById(evaluationId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Get all evaluations for the submissions
    @PreAuthorize("hasRole('JUDGE')")
    @GetMapping("/evaluations/submission/{submissionId}")
    public ResponseEntity<ResponseStatus<List<EvaluationResponseDto>>> getSubmissionEvaluations(@PathVariable Integer submissionId) {
        List<EvaluationResponseDto> response = evaluationService.getSubmissionEvaluations(submissionId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Get all evaluations for hackathon
    @PreAuthorize("hasAnyRole('JUDGE', 'ORGANIZER')")
    @GetMapping("/evaluations/hackathon/{hackathonId}")
    public ResponseEntity<ResponseStatus<List<EvaluationResponseDto>>> getHackathonEvaluations(@PathVariable Integer hackathonId) {
        List<EvaluationResponseDto> response = evaluationService.getHackathonEvaluations(hackathonId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Get judge's evaluations
    @PreAuthorize("hasRole('JUDGE')")
    @GetMapping("/evaluations/judge/{judgeId}")
    public ResponseEntity<ResponseStatus<List<EvaluationResponseDto>>> getJudgeEvaluations(@PathVariable Integer judgeId) {
        List<EvaluationResponseDto> response = evaluationService.getJudgeEvaluations(judgeId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Get pending submissions for judge
    @PreAuthorize("hasRole('JUDGE')")
    @GetMapping("/evaluations/judge/{judgeId}/pending")
    public ResponseEntity<ResponseStatus<List<SubmissionResponseDto>>> getPendingSubmissions(@PathVariable Integer judgeId) {
        List<SubmissionResponseDto> response = evaluationService.getPendingSubmissionsForJudge(judgeId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Get judge stats
    @PreAuthorize("hasRole('JUDGE')")
    @GetMapping("/evaluations/judge/{judgeId}/stats")
    public ResponseEntity<ResponseStatus<JudgeStatsResponseDto>> getJudgeStats(@PathVariable Integer judgeId) {
        JudgeStatsResponseDto response = evaluationService.getJudgeStats(judgeId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Get leaderboard
    @PreAuthorize("hasAnyRole('JUDGE', 'ORGANIZER')")
    @GetMapping("/evaluations/hackathon/{hackathonId}/leaderboard")
    public ResponseEntity<ResponseStatus<List<LeaderboardResponseDto>>> getLeaderboard(@PathVariable Integer hackathonId) {
        List<LeaderboardResponseDto> response = evaluationService.getLeaderboard(hackathonId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Get the status of the evaluated submission
    @PreAuthorize("hasRole('JUDGE')")
    @GetMapping("/evaluations/judge/{judgeId}/submissions/status")
    public ResponseEntity<ResponseStatus<List<SubmissionEvaluationStatusDto>>> getSubmissionEvaluationStatus(@PathVariable Integer judgeId) {
        List<SubmissionEvaluationStatusDto> response = evaluationService.getSubmissionsWithEvaluationStatus(judgeId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }
}
