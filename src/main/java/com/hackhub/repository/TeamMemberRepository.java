package com.hackhub.repository;

import com.hackhub.entities.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Integer> {
    List<TeamMember> findByTeamId(Integer teamId);

    @Query("SELECT tm FROM TeamMember tm JOIN FETCH tm.team t JOIN FETCH t.hackathon JOIN FETCH t.leader WHERE tm.user.id = :userId")
    List<TeamMember> findByUserIdWithDetails(@Param("userId") Integer userId);
}
