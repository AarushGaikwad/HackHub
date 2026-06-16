package com.hackhub.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hackhub.entities.Hackathon;

public interface HackathonRepository extends JpaRepository<Hackathon, Integer> {

}
