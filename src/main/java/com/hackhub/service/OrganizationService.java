package com.hackhub.service;

import com.hackhub.entities.Organization;
import com.hackhub.repository.OrganizationRepository;
import com.hackhub.requestdto.OrganizationRequestDto;
import com.hackhub.responsedto.OrganizationResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    @Autowired
    public OrganizationService(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    // Create organization
    public OrganizationResponseDto createOrganization(OrganizationRequestDto request) {

        if (organizationRepository.existsByName(request.getName()))
            throw new RuntimeException("Organization already exists");

        Organization organization = Organization.builder()
                .name(request.getName())
                .type(request.getType())
                .build();

        Organization savedOrganization = organizationRepository.save(organization);

        return OrganizationResponseDto.builder()
                .id(savedOrganization.getId())
                .name(savedOrganization.getName())
                .type(savedOrganization.getType())
                .build();
    }

    // Get all organizations
    public List<OrganizationResponseDto> getAllOrganizations() {
        List<Organization> organizations = organizationRepository.findAll();
        return organizations.stream()
                .map(organization -> OrganizationResponseDto.builder()
                        .id(organization.getId())
                        .name(organization.getName())
                        .type(organization.getType())
                        .build())
                .collect(Collectors.toList());
    }
}