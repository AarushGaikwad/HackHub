package com.hackhub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CertificateResponseDTO {

    private Integer id;
    private UserResponseDTO user;           // nested DTO
    private HackathonResponseDTO hackathon; // nested DTO
    private String type;
    private LocalDateTime issuedAt;
}
