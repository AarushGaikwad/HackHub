package com.hackhub.repository;

import com.hackhub.entities.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Integer> {
    List<TeamMember> findByTeamId(Integer teamId);

    @Query("SELECT tm FROM TeamMember tm JOIN FETCH tm.team t JOIN FETCH t.leader WHERE tm.user.id = :userId")
    List<TeamMember> findByUserIdWithDetails(@Param("userId") Integer userId);

    boolean existsByTeamIdAndUserId(Integer teamId, Integer userId);

    @Query("SELECT COUNT(tm) FROM TeamMember tm WHERE tm.team.id =:teamId")
    Integer countByTeamId(@Param("teamId") Integer teamId);

    List<TeamMember> findByUserId(Integer userId);

    /*
        // needed for join team — check user not already in a team for this hackathon
        @Query("SELECT COUNT(tm) > 0 FROM TeamMember tm WHERE tm.user.id = :userId AND tm.team.hackathon.id = :hackathonId")
        boolean existsByUserIdAndHackathonId(@Param("userId") Integer userId, @Param("hackathonId") Integer hackathonId);

    */



}
