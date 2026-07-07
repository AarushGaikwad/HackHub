package com.hackhub.repository;

import com.hackhub.entities.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Integer> {

    // Get all certificates for a user
    List<Certificate> findByUserId(Integer userId);

    // Get all certificates for a hackathon
    List<Certificate> findByHackathonId(Integer hackathonId);

    // Check if certificates already exists
    boolean existsByUserIdAndHackathonIdAndType(Integer userId, Integer hackathonId, String type);

    // Get certificates for a user in a specific hackathon
    List<Certificate> findByUserIdAndHackathonId(Integer userId, Integer hackathonId);
}
