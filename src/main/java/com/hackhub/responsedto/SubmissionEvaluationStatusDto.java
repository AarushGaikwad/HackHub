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
public class SubmissionEvaluationStatusDto {

    private Integer submissionId;
    private String submissionTitle;
    private String teamName;
    private String hackathonTitle;
    private String submissionStatus;
    private String githubUrl;
    private String resourceUrl;
    private LocalDateTime submittedAt;
    private Boolean evaluated;
}
