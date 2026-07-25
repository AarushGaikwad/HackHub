package com.hackhub.repository;

import com.hackhub.entities.JudgeAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JudgeAssignmentRepository extends JpaRepository<JudgeAssignment, Integer> {

    // Check if judge is already assigned to hackathon
    boolean existsByHackathonIdAndJudgeIdAndStatus(Integer hackathonId, Integer judgeId, String status);

    // Get all active judges for a hackathon
    List<JudgeAssignment> findByHackathonIdAndStatus(Integer hackathonId, String status);

    // Get all active hackathons assigned to a judge
    List<JudgeAssignment> findByJudgeIdAndStatus(Integer judgeId, String status);

    // Find specific assignment
    Optional<JudgeAssignment> findByHackathonIdAndJudgeId(Integer hackathonId, Integer judgeId);

    // Get with details
    @Query("""
        SELECT ja
        FROM JudgeAssignment ja
            JOIN FETCH ja.hackathon h
            JOIN FETCH ja.judge j
            JOIN FETCH ja.assignedBy ab
        WHERE ja.hackathon.id = :hackathonId
          AND ja.status = 'ACTIVE'
    """)
    List<JudgeAssignment> findActiveJudgesByHackathonWithDetails(@Param("hackathonId") Integer hackathonId);

    @Query("""
        SELECT ja
        FROM JudgeAssignment ja
            JOIN FETCH ja.hackathon h
            JOIN FETCH ja.judge j
        WHERE ja.judge.id = :judgeId
          AND ja.status = 'ACTIVE'
    """)
    List<JudgeAssignment> findActiveHackathonsByJudgeWithDetails(@Param("judgeId") Integer judgeId);
}
