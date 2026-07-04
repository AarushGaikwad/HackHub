package com.hackhub.responsedto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class LeaderboardResponseDto {

    private Integer rank;
    private String teamName;
    private String finalSubmissionTitle;
    private Double averageScore;
    private Integer totalEvaluations;
}
