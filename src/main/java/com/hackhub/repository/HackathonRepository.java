package com.hackhub.repository;

import com.hackhub.entities.Hackathon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface HackathonRepository extends JpaRepository<Hackathon, Integer> {

    // Get all hackathons created by organizer
    List<Hackathon> findByCreatedById(Integer organizerId);

    // Get all hackathons of organization
    List<Hackathon> findByOrganizationId(Integer organizationId);

    // Search by title
    List<Hackathon> findByTitleContainingIgnoreCase(String keyword);

    // Active hackathons
    @Query("select h from Hackathon h WHERE h.startDate <= :now AND h.endDate >= :now")
    List<Hackathon> findActiveHackathons(@Param("now") LocalDateTime now);

    // Upcoming hackathons
    List<Hackathon> findByStartDateAfter(LocalDateTime startDate);

    // Completed hackathon
    List<Hackathon> findByEndDateBefore(LocalDateTime endDate);
}