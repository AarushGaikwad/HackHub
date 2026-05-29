package com.hackhub.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EvaluationResponseDTO {

    private Integer id;
    private SubmissionResponseDTO submission;   // nested DTO
    private UserResponseDTO judge;              // nested DTO
    private Double score;
    private String feedback;
    private LocalDateTime evaluatedAt;
}
