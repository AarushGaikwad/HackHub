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
public class SubmissionResponseDto {

    private Integer id;
    private Integer teamRegistrationId;
    private String teamName;
    private String hackathonTitle;
    private String submittedByName;
    private String title;
    private String description;
    private String githubUrl;
    private String resourceUrl;
    private String status;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
}
