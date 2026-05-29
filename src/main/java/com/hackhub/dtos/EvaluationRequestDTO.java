package com.hackhub.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EvaluationRequestDTO {

    private Integer submissionId;   // FK reference
    private Integer judgeId;        // FK reference - judge user
    private Double score;
    private String feedback;
}
