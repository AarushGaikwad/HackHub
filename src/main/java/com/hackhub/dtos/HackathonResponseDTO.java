package com.hackhub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HackathonResponseDTO {

    private Integer id;
    private String title;
    private String description;
    private String rules;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private OrganizationResponseDTO organization;   // nested DTO
    private UserResponseDTO createdBy;              // nested DTO
}
