package com.hackhub.repository;

import com.hackhub.entities.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Integer> {

    // get all submissions for a registered team
    List<Submission> findByTeamRegistrationId(Integer teamRegistrationId);

    // get final submissions for a registered team
    Optional<Submission> findByTeamRegistrationIdAndStatus(Integer teamRegistrationId, String status);

    // check if final submissions exists for a registered team in a hackathon
    boolean existsByTeamRegistrationIdAndStatus(Integer teamRegistrationId, String status);

    // get all submissions for a hackathon
    @Query("SELECT s FROM Submission s JOIN FETCH s.teamRegistration tr JOIN FETCH tr.team t JOIN FETCH tr.hackathon h WHERE h.id = :hackathonId")
    List<Submission> findByHackathonId(@Param("hackathonId") Integer hackathonId);

    // check if submission belongs to a specific user
    boolean existsByIdAndSubmittedById(Integer submissionId, Integer userId);

    // get all submission by user
    List<Submission> findBySubmittedById(Integer userId);

    // get only final submissions for a hackathon
    @Query("SELECT s FROM Submission s JOIN FETCH s.teamRegistration tr JOIN FETCH tr.team t JOIN FETCH tr.hackathon h WHERE h.id = :hackathonId AND s.status = 'FINAL'")
    List<Submission> findFinalSubmissionsByHackathonId(@Param("hackathonId") Integer hackathonId);
}
