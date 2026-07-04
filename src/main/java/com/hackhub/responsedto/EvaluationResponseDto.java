package com.hackhub.responsedto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class EvaluationResponseDto {

    private Integer id;
    private Integer submissionId;
    private String submissionTitle;
    private String teamName;
    private String hackathonTitle;
    private Integer judgeId;
    private String judgeName;
    private Double score;
    private String feedback;
    private LocalDateTime evaluatedAt;
}
