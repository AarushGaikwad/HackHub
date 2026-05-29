package com.hackhub.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HackathonRequestDTO {

    private String title;
    private String description;
    private String rules;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer organizationId;   // FK reference
    private Integer createdById;      // FK reference - user who creates it
}
