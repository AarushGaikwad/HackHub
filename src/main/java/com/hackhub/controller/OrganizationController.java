package com.hackhub.controller;

import com.hackhub.requestdto.OrganizationRequestDto;
import com.hackhub.responsedto.OrganizationResponseDto;
import com.hackhub.responsestatus.ResponseStatus;
import com.hackhub.service.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/organization")
public class OrganizationController {

    private OrganizationService organizationService;

    @Autowired
    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    // Create organization
    @PostMapping("/create")
    public ResponseEntity<ResponseStatus<OrganizationResponseDto>> createOrganization(@RequestBody @Valid OrganizationRequestDto organizationRequestDto) {
        OrganizationResponseDto response = organizationService.createOrganization(organizationRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ResponseStatus.success(response));
    }

    // Get all organizations
    @GetMapping("/organizations")
    public ResponseEntity<ResponseStatus<List<OrganizationResponseDto>>> getAllOrganizations() {
        List<OrganizationResponseDto> responseList = organizationService.getAllOrganizations();
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(responseList));
    }
}