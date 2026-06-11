package com.hackhub.repository;

import com.hackhub.entities.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizationRepository
        extends JpaRepository<Organization,Integer> {

    boolean existsByName(String name);
}