package com.hackhub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubmissionResponseDTO {

    private Integer id;
    private TeamResponseDTO team;     // nested DTO
    private String title;
    private String description;
    private String githubLink;
    private String fileUrl;
    private String status;
    private LocalDateTime submittedAt;
}
