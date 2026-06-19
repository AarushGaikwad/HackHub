package com.hackhub.repository;

import com.hackhub.entities.Hackathon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HackathonRepository extends JpaRepository<Hackathon, Integer> {

    // Get all hackathons created by organizer
    List<Hackathon> findByCreatedById(Integer organizerId);

    // Get all hackathons of organization
    List<Hackathon> findByOrganizationId(Integer organizationId);

    // Search by title
    List<Hackathon> findByTitleContainingIgnoreCase(String keyword);

}