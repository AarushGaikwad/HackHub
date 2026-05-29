package com.hackhub.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TeamResponseDTO {

    private Integer id;
    private String name;
    private HackathonResponseDTO hackathon;   // nested DTO
    private UserResponseDTO leader;           // nested DTO
    private LocalDateTime createdAt;
}
