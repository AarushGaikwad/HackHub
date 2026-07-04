package com.hackhub.responsedto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class JudgeStatsResponseDto {

    private Integer judgeId;
    private String judgeName;
    private Long totalEvaluations;
    private Double averageScoreGiven;
    private Integer hackathonsJudged;
}
