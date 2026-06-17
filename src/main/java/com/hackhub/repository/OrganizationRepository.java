package com.hackhub.repository;

import com.hackhub.entities.Organization;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrganizationRepository extends JpaRepository<Organization,Integer> {

    Optional<Organization> findByName(String name);
    boolean existsByName(String name);
}