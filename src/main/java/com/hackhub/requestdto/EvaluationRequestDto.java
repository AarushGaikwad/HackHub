package com.hackhub.requestdto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class EvaluationRequestDto {

    @NotNull(message = "Submission ID is required")
    private Integer submissionId;

    @NotNull(message = "Judge ID is required")
    private Integer judgeId; // TODO: remove after JWT

    @NotNull(message = "Score is required")
    @Min(value = 0, message = "Score must be at least 0")
    @Max(value = 100, message = "Score must not exceed 100")
    private Double score;

    @NotBlank(message = "Feedback is required")
    private String feedback;
}
