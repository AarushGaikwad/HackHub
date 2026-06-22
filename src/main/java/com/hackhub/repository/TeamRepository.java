package com.hackhub.repository;

import com.hackhub.entities.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, Integer> {

    @Query("SELECT t FROM Team t JOIN FETCH t.hackathon JOIN FETCH t.leader WHERE t.id = :id ")
    Optional<Team> findByIdWithDetails(@Param("id") Integer id);
}
