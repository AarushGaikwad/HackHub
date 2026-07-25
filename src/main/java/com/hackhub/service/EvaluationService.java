package com.hackhub.service;

import com.hackhub.entities.*;
import com.hackhub.repository.*;
import com.hackhub.requestdto.EvaluationRequestDto;
import com.hackhub.responsedto.*;
import com.hackhub.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final JudgeAssignmentRepository judgeAssignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final HackathonRepository hackathonRepository;
    private final SecurityUtils securityUtils;

    @Autowired
    public EvaluationService(EvaluationRepository evaluationRepository,
                             JudgeAssignmentRepository judgeAssignmentRepository,
                             SubmissionRepository submissionRepository,
                             UserRepository userRepository,
                             HackathonRepository hackathonRepository, SecurityUtils securityUtils) {
        this.evaluationRepository = evaluationRepository;
        this.judgeAssignmentRepository = judgeAssignmentRepository;
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
        this.hackathonRepository = hackathonRepository;
        this.securityUtils = securityUtils;
    }

    // Assign judge to hackathon
    public JudgeAssignmentResponseDto assignJudge(Integer hackathonId,
                                                  Integer judgeId,
                                                  Integer organizerId) {

        // Validate hackathon exists
        Hackathon hackathon = hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new RuntimeException(
                        "Hackathon not found with id: " + hackathonId));

        // Validate organizer exists and has ORGANIZER role
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException(
                        "User not found with id: " + organizerId));

        if (!"ORGANIZER".equalsIgnoreCase(organizer.getRole()))
            throw new RuntimeException("Only organizer can assign judges");

        // Validate judge exists and has JUDGE role
        User judge = userRepository.findById(judgeId)
                .orElseThrow(() -> new RuntimeException(
                        "User not found with id: " + judgeId));

        if (!"JUDGE".equalsIgnoreCase(judge.getRole()))
            throw new RuntimeException("User is not a judge");

        // Check if judge already assigned
        if (judgeAssignmentRepository.existsByHackathonIdAndJudgeIdAndStatus(
                hackathonId, judgeId, "ACTIVE"))
            throw new RuntimeException("Judge is already assigned to this hackathon");

        // Check if previously inactive — reactivate
        Optional<JudgeAssignment> existing = judgeAssignmentRepository
                .findByHackathonIdAndJudgeId(hackathonId, judgeId);

        JudgeAssignment assignment;
        if (existing.isPresent()) {
            assignment = existing.get();
            assignment.setStatus("ACTIVE");
        } else {
            assignment = JudgeAssignment.builder()
                    .hackathon(hackathon)
                    .judge(judge)
                    .assignedBy(organizer)
                    .status("ACTIVE")
                    .assignedAt(LocalDateTime.now())
                    .build();
        }

        JudgeAssignment saved = judgeAssignmentRepository.save(assignment);
        return mapToAssignmentResponse(saved);
    }

    // Remove judge from hackathon (soft delete)
    public void removeJudge(Integer hackathonId,
                            Integer judgeId,
                            Integer organizerId) {

        // Validate organizer
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException(
                        "User not found with id: " + organizerId));

        if (!"ORGANIZER".equalsIgnoreCase(organizer.getRole()))
            throw new RuntimeException("Only organizer can remove judges");

        // Find assignment
        JudgeAssignment assignment = judgeAssignmentRepository
                .findByHackathonIdAndJudgeId(hackathonId, judgeId)
                .orElseThrow(() -> new RuntimeException(
                        "Judge is not assigned to this hackathon"));

        // Soft delete
        assignment.setStatus("INACTIVE");
        judgeAssignmentRepository.save(assignment);
    }

    // Get all assigned judges for hackathon
    public List<JudgeAssignmentResponseDto> getAssignedJudges(Integer hackathonId) {
        hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new RuntimeException(
                        "Hackathon not found with id: " + hackathonId));

        return judgeAssignmentRepository
                .findActiveJudgesByHackathonWithDetails(hackathonId)
                .stream()
                .map(this::mapToAssignmentResponse)
                .collect(Collectors.toList());
    }

    // Get all hackathons assigned to a judge
    public List<JudgeAssignmentResponseDto> getJudgeHackathons(Integer judgeId) {
        userRepository.findById(judgeId)
                .orElseThrow(() -> new RuntimeException(
                        "User not found with id: " + judgeId));

        return judgeAssignmentRepository
                .findActiveHackathonsByJudgeWithDetails(judgeId)
                .stream()
                .map(this::mapToAssignmentResponse)
                .collect(Collectors.toList());
    }

    // Submit evaluation
    public EvaluationResponseDto submitEvaluation(EvaluationRequestDto request) {

        Integer judgeId = securityUtils.getCurrentUserId();

        // Validate submission exists
        Submission submission = submissionRepository.findById(request.getSubmissionId())
                .orElseThrow(() -> new RuntimeException("Submission not found with id: " + request.getSubmissionId()));

        // Validate judge exists
        User judge = userRepository.findById(judgeId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"JUDGE".equalsIgnoreCase(judge.getRole()))
            throw new RuntimeException("User is not a judge");

        // Validate judge is assigned to this hackathon
        Integer hackathonId = submission.getTeamRegistration().getHackathon().getId();
        if (!judgeAssignmentRepository.existsByHackathonIdAndJudgeIdAndStatus(hackathonId, judgeId, "ACTIVE"))
            throw new RuntimeException("Judge is not assigned to this hackathon");

        // Check hackathon is ACTIVE
        Hackathon hackathon = submission.getTeamRegistration().getHackathon();
        LocalDateTime now = LocalDateTime.now();
        if (hackathon.getStartDate().isAfter(now))
            throw new RuntimeException("Hackathon has not started yet");
        if (hackathon.getEndDate().isBefore(now))
            throw new RuntimeException("Hackathon has already ended");

        // Check duplicate evaluation
        if (evaluationRepository.existsBySubmissionIdAndJudgeId(
                request.getSubmissionId(), judgeId))
            throw new RuntimeException(
                    "You have already evaluated this submission");

        // Build and save evaluation
        Evaluation evaluation = Evaluation.builder()
                .submission(submission)
                .judge(judge)
                .score(request.getScore())
                .feedback(request.getFeedback())
                .evaluatedAt(LocalDateTime.now())
                .build();

        Evaluation saved = evaluationRepository.save(evaluation);
        return mapToEvaluationResponse(saved);
    }

    // Update evaluation
    public EvaluationResponseDto updateEvaluation(Integer evaluationId, EvaluationRequestDto request) {

        Integer judgeId = securityUtils.getCurrentUserId();

        // Validate evaluation exists
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new RuntimeException(
                        "Evaluation not found with id: " + evaluationId));

        // Validate judge owns this evaluation
        if (!evaluation.getJudge().getId().equals(judgeId))
            throw new RuntimeException(
                    "You can only update your own evaluations");

        // Check hackathon is still ACTIVE
        Hackathon hackathon = evaluation.getSubmission()
                .getTeamRegistration().getHackathon();
        if (hackathon.getEndDate().isBefore(LocalDateTime.now()))
            throw new RuntimeException(
                    "Cannot update evaluation after hackathon has ended");

        // Update fields
        evaluation.setScore(request.getScore());
        evaluation.setFeedback(request.getFeedback());
        evaluation.setEvaluatedAt(LocalDateTime.now());

        Evaluation updated = evaluationRepository.save(evaluation);
        return mapToEvaluationResponse(updated);
    }

    // Get evaluation by id
    public EvaluationResponseDto getEvaluationById(Integer evaluationId) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new RuntimeException(
                        "Evaluation not found with id: " + evaluationId));
        return mapToEvaluationResponse(evaluation);
    }

    // Get all evaluations for a submission
    public List<EvaluationResponseDto> getSubmissionEvaluations(Integer submissionId) {
        submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException(
                        "Submission not found with id: " + submissionId));

        return evaluationRepository.findBySubmissionId(submissionId)
                .stream()
                .map(this::mapToEvaluationResponse)
                .collect(Collectors.toList());
    }

    // Get all evaluations for a hackathon
    public List<EvaluationResponseDto> getHackathonEvaluations(Integer hackathonId) {
        hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new RuntimeException(
                        "Hackathon not found with id: " + hackathonId));

        return evaluationRepository.findByHackathonId(hackathonId)
                .stream()
                .map(this::mapToEvaluationResponse)
                .collect(Collectors.toList());
    }

    // Get all evaluations by a judge
    public List<EvaluationResponseDto> getJudgeEvaluations(Integer judgeId) {
        userRepository.findById(judgeId)
                .orElseThrow(() -> new RuntimeException(
                        "User not found with id: " + judgeId));

        return evaluationRepository.findByJudgeId(judgeId)
                .stream()
                .map(this::mapToEvaluationResponse)
                .collect(Collectors.toList());
    }

    // Get pending submissions for a judge
    public List<SubmissionResponseDto> getPendingSubmissionsForJudge(Integer judgeId) {
        userRepository.findById(judgeId)
                .orElseThrow(() -> new RuntimeException(
                        "User not found with id: " + judgeId));

        return evaluationRepository.findPendingSubmissionsForJudge(judgeId)
                .stream()
                .map(s -> SubmissionResponseDto.builder()
                        .id(s.getId())
                        .teamRegistrationId(s.getTeamRegistration().getId())
                        .teamName(s.getTeamRegistration().getTeam().getName())
                        .hackathonTitle(s.getTeamRegistration().getHackathon().getTitle())
                        .submittedByName(s.getSubmittedBy().getName())
                        .title(s.getTitle())
                        .description(s.getDescription())
                        .githubUrl(s.getGithubUrl())
                        .resourceUrl(s.getResourceUrl())
                        .status(s.getStatus())
                        .submittedAt(s.getSubmittedAt())
                        .updatedAt(s.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // Get judge stats
    public JudgeStatsResponseDto getJudgeStats(Integer judgeId) {
        User judge = userRepository.findById(judgeId)
                .orElseThrow(() -> new RuntimeException(
                        "User not found with id: " + judgeId));

        Object[] stats = evaluationRepository.findJudgeStats(judgeId);

        Object[] values = (Object[]) stats[0];


        System.out.println("stats class = " + stats.getClass());

        System.out.println("stats length = " + stats.length);

        for (int i = 0; i < stats.length; i++) {
            System.out.println("stats[" + i + "] = " + stats[i]);

            if (stats[i] != null) {
                System.out.println(stats[i].getClass());
            }
        }
        Integer hackathonsJudged = evaluationRepository
                .countDistinctHackathonsJudged(judgeId);

        Long totalEvaluations = values[0] != null ? ((Number) values[0]).longValue() : 0L;

        Double averageScore = values[1] != null ? ((Number) values[1]).doubleValue() : 0.0;

        return JudgeStatsResponseDto.builder()
                .judgeId(judgeId)
                .judgeName(judge.getName())
                .totalEvaluations(totalEvaluations)
                .averageScoreGiven(averageScore)
                .hackathonsJudged(hackathonsJudged)
                .build();
    }

    // Get leaderboard
    public List<LeaderboardResponseDto> getLeaderboard(Integer hackathonId) {
        hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new RuntimeException(
                        "Hackathon not found with id: " + hackathonId));

        List<Object[]> results = evaluationRepository
                .findLeaderboardByHackathonId(hackathonId);

        List<LeaderboardResponseDto> leaderboard = new ArrayList<>();
        int rank = 1;

        for (Object[] row : results) {
            leaderboard.add(LeaderboardResponseDto.builder()
                    .rank(rank++)
                    .teamName((String) row[0])
                    .averageScore(((Number) row[1]).doubleValue())
                    .totalEvaluations(((Number) row[2]).intValue())
                    .build());
        }

        return leaderboard;
    }

    // Get all submission with evaluation status for a judge
    public List<SubmissionEvaluationStatusDto> getSubmissionsWithEvaluationStatus(Integer judgeId) {
        userRepository.findById(judgeId).orElseThrow(() -> new RuntimeException("User not found with id: " + judgeId));

        List<Object[]> results = evaluationRepository.findSubmissionsWithEvaluationStatus(judgeId);

        return results.stream()
                .map(row -> {
                    Submission s = (Submission) row[0];
                    Boolean evaluated = (Boolean) row[1];
                    return SubmissionEvaluationStatusDto.builder()
                            .submissionId(s.getId())
                            .submissionTitle(s.getTitle())
                            .teamName(s.getTeamRegistration().getTeam().getName())
                            .hackathonTitle(s.getTeamRegistration().getHackathon().getTitle())
                            .submissionStatus(s.getStatus())
                            .githubUrl(s.getGithubUrl())
                            .resourceUrl(s.getResourceUrl())
                            .submittedAt(s.getSubmittedAt())
                            .evaluated(evaluated)
                            .build();
                })
                .collect(Collectors.toList());
    }



    private JudgeAssignmentResponseDto mapToAssignmentResponse(JudgeAssignment ja) {
        return JudgeAssignmentResponseDto.builder()
                .id(ja.getId())
                .hackathonId(ja.getHackathon().getId())
                .hackathonTitle(ja.getHackathon().getTitle())
                .judgeId(ja.getJudge().getId())
                .judgeName(ja.getJudge().getName())
                .judgeEmail(ja.getJudge().getEmail())
                .assignedByName(ja.getAssignedBy().getName())
                .status(ja.getStatus())
                .assignedAt(ja.getAssignedAt())
                .build();
    }

    private EvaluationResponseDto mapToEvaluationResponse(Evaluation e) {
        return EvaluationResponseDto.builder()
                .id(e.getId())
                .submissionId(e.getSubmission().getId())
                .submissionTitle(e.getSubmission().getTitle())
                .teamName(e.getSubmission().getTeamRegistration().getTeam().getName())
                .hackathonTitle(e.getSubmission().getTeamRegistration()
                        .getHackathon().getTitle())
                .judgeId(e.getJudge().getId())
                .judgeName(e.getJudge().getName())
                .score(e.getScore())
                .feedback(e.getFeedback())
                .evaluatedAt(e.getEvaluatedAt())
                .build();
    }
}
