package com.hackhub.service;

import com.hackhub.entities.Hackathon;
import com.hackhub.entities.Organization;
import com.hackhub.entities.User;
import com.hackhub.repository.HackathonRepository;
import com.hackhub.repository.OrganizationRepository;
import com.hackhub.repository.UserRepository;
import com.hackhub.requestdto.HackathonRequestDto;
import com.hackhub.responsedto.HackathonResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.*;
import lombok.*;

@Service
public class HackathonService {

    private final HackathonRepository hackathonRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    @Autowired
    public HackathonService(HackathonRepository hackathonRepository,
                            OrganizationRepository organizationRepository,
                            UserRepository userRepository) {
        this.hackathonRepository = hackathonRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
    }

    // Create Hackathon
    public HackathonResponseDto createHackathon(HackathonRequestDto request) {

        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new RuntimeException("End date must be greater than start date");
        }

        Organization organization = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        User organizer = userRepository.findById(request.getCreatedBy())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"ORGANIZER".equalsIgnoreCase(organizer.getRole())) {
            throw new RuntimeException("Only ORGANIZER can create hackathon");
        }

        Hackathon hackathon = Hackathon.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .rules(request.getRules())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .organization(organization)
                .createdBy(organizer)
                .build();

        Hackathon savedHackathon = hackathonRepository.save(hackathon);

        return mapToResponse(savedHackathon);
    }

    // Get All Hackathons
    public List<HackathonResponseDto> getAllHackathons() {

        return hackathonRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get Hackathon By Id
    public HackathonResponseDto getHackathonById(Integer id) {

        Hackathon hackathon = hackathonRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Hackathon not found with id : " + id));

        return mapToResponse(hackathon);
    }
    
    //Get Hackathons By Organizer /Phase-2
    
    public List<HackathonResponseDto> getHackathonsByOrganizer(Integer organizerId) {

        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Organizer not found"));

        if (!"ORGANIZER".equalsIgnoreCase(organizer.getRole())) {
            throw new RuntimeException("User is not an organizer");
        }

        return hackathonRepository.findByCreatedById(organizerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    
    //Get Hackathons by Organization /Phase-2
    
    public List<HackathonResponseDto> getHackathonsByOrganization(Integer organizationId) {

        organizationRepository.findById(organizationId)
                .orElseThrow(() ->
                        new RuntimeException("Organization not found"));

        return hackathonRepository.findByOrganizationId(organizationId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    
    //Search Hackathons
    
    public List<HackathonResponseDto> searchHackathons(String keyword) {

        if (keyword == null || keyword.trim().isEmpty()) {
            throw new RuntimeException("Keyword cannot be blank");
        }

        return hackathonRepository
                .findByTitleContainingIgnoreCase(keyword)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    
    // Update Hackathon
    public HackathonResponseDto updateHackathon(Integer id,
                                                HackathonRequestDto request) {

        Hackathon hackathon = hackathonRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Hackathon not found with id : " + id));

        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new RuntimeException("End date must be greater than start date");
        }

        hackathon.setTitle(request.getTitle());
        hackathon.setDescription(request.getDescription());
        hackathon.setRules(request.getRules());
        hackathon.setStartDate(request.getStartDate());
        hackathon.setEndDate(request.getEndDate());

        Hackathon updatedHackathon = hackathonRepository.save(hackathon);

        return mapToResponse(updatedHackathon);
    }

    // Delete Hackathon
    public void deleteHackathon(Integer id) {

        Hackathon hackathon = hackathonRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Hackathon not found with id : " + id));

        hackathonRepository.delete(hackathon);
    }

    private HackathonResponseDto mapToResponse(Hackathon hackathon) {

        return HackathonResponseDto.builder()
                .id(hackathon.getId())
                .title(hackathon.getTitle())
                .description(hackathon.getDescription())
                .rules(hackathon.getRules())
                .startDate(hackathon.getStartDate())
                .endDate(hackathon.getEndDate())
                .organizationName(hackathon.getOrganization().getName())
                .organizerName(hackathon.getCreatedBy().getName())
                .build();
    }
}