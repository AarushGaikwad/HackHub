package com.hackhub.repository;

import com.hackhub.entities.TeamRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRegistrationRepository extends JpaRepository<TeamRegistration, Integer> {

    // Check if team is already registered for a hackathon
    boolean existsByTeamIdAndHackathonId(Integer teamId, Integer hackathonId);

    // Get all registrations for a hackathon
    List<TeamRegistration> findByHackathonId(Integer hackathonId);

    // Get all registrations for a team
    List<TeamRegistration> findByTeamId(Integer teamId);

    // Find specific registration
    Optional<TeamRegistration> findByTeamIdAndHackathonId(Integer teamId, Integer hackathonId);

    // Get all registrations for a team with details
    @Query("SELECT tr FROM TeamRegistration tr JOIN FETCH tr.team t JOIN FETCH tr.hackathon h WHERE t.id = :teamId")
    List<TeamRegistration> findByTeamIdWithDetails(@Param("teamId") Integer teamId);

    // Get all registrations for a hackathon with details
    @Query("SELECT tr FROM TeamRegistration tr JOIN FETCH tr.team JOIN FETCH tr.hackathon WHERE tr.hackathon.id = :hackathonId")
    List<TeamRegistration> findByHackathonIdWithDetails(@Param("hackathonId") Integer hackathonId);

    // check if the user is already in another or not when user is trying to join a particular team
    @Query("SELECT CASE WHEN COUNT(tr) > 0 THEN true ELSE false END " +
            "FROM TeamRegistration tr " +
            "WHERE tr.hackathon.id = :hackathonId " +
            "AND EXISTS (" +
            "    SELECT tm FROM TeamMember tm " +
            "    WHERE tm.team.id = tr.team.id " +
            "    AND tm.user.id = :userId" +
            ")")
    boolean existsByUserIdAndHackathonId(@Param("userId") Integer userId,
                                         @Param("hackathonId") Integer hackathonId);
}
