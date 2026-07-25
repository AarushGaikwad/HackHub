package com.hackhub.repository;

import com.hackhub.entities.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, Integer> {

    @Query("SELECT t FROM Team t JOIN FETCH t.leader WHERE t.id = :teamId")
    Optional<Team> findByIdWithDetails(@Param("teamId") Integer id);

    Optional<Team> findByInviteCode(String inviteCode);

    List<Team> findByNameContainingIgnoreCase(String name);
}
