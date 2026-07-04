package com.hackhub.repository;

import com.hackhub.entities.Evaluation;
import com.hackhub.entities.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Integer> {

    // Check if judge already evaluated this submission
    boolean existsBySubmissionIdAndJudgeId(Integer submissionId, Integer judgeId);

    // Find specific evaluation
    Optional<Evaluation> findBySubmissionIdAndJudgeId(Integer submissionId, Integer judgeId);

    // Get all evaluations for a submission
    List<Evaluation> findBySubmissionId(Integer submissionId);

    // Get all evaluations by a judge
    List<Evaluation> findByJudgeId(Integer judgeId);

    // Get all evaluations for a hackathon
    @Query("""
        SELECT e
        FROM Evaluation e
            JOIN FETCH e.submission s
            JOIN FETCH s.teamRegistration tr
            JOIN FETCH tr.hackathon h
            JOIN FETCH tr.team t
            JOIN FETCH e.judge j
        WHERE h.id = :hackathonId
    """)
    List<Evaluation> findByHackathonId(@Param("hackathonId") Integer hackathonId);

    // Get pending submissions for a judge
    // (assigned hackathons submissions not yet evaluated by this judge)
    @Query("""
        SELECT s
        FROM Submission s
            JOIN s.teamRegistration tr
            JOIN JudgeAssignment ja ON ja.hackathon.id = tr.hackathon.id
        WHERE ja.judge.id = :judgeId
          AND ja.status = 'ACTIVE'
          AND NOT EXISTS (
                SELECT e
                FROM Evaluation e
                WHERE e.submission.id = s.id
                  AND e.judge.id = :judgeId
          )
    """)
    List<Submission> findPendingSubmissionsForJudge(@Param("judgeId") Integer judgeId);

    // Leaderboard — avg score per team based on FINAL submissions only
    @Query("""
        SELECT tr.team.name,
               AVG(e.score),
               COUNT(e.id)
        FROM Evaluation e
            JOIN e.submission s
            JOIN s.teamRegistration tr
        WHERE tr.hackathon.id = :hackathonId
          AND s.status = 'FINAL'
        GROUP BY tr.team.id, tr.team.name
        ORDER BY AVG(e.score) DESC
    """)
    List<Object[]> findLeaderboardByHackathonId(@Param("hackathonId") Integer hackathonId);

    // Judge stats
    @Query("SELECT COUNT(e), AVG(e.score) FROM Evaluation e WHERE e.judge.id = :judgeId")
    Object[] findJudgeStats(@Param("judgeId") Integer judgeId);

    // Count distinct hackathons judged
    @Query("""
        SELECT COUNT(DISTINCT tr.hackathon.id)
        FROM Evaluation e
            JOIN e.submission s
            JOIN s.teamRegistration tr
        WHERE e.judge.id = :judgeId
    """)
    Integer countDistinctHackathonsJudged(@Param("judgeId") Integer judgeId);
    @Query("""
    SELECT s,
           CASE
               WHEN EXISTS (
                   SELECT e
                   FROM Evaluation e
                   WHERE e.submission.id = s.id
                     AND e.judge.id = :judgeId
               )
               THEN true
               ELSE false
           END
    FROM Submission s
        JOIN s.teamRegistration tr
        JOIN JudgeAssignment ja ON ja.hackathon.id = tr.hackathon.id
    WHERE ja.judge.id = :judgeId
      AND ja.status = 'ACTIVE'
    """)
    List<Object[]> findSubmissionsWithEvaluationStatus(@Param("judgeId") Integer judgeId);
}
