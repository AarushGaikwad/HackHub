package com.hackhub.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubmissionRequestDTO {

    private Integer teamId;       // FK reference
    private String title;
    private String description;
    private String githubLink;
    private String fileUrl;
    private String status;        // e.g. SUBMITTED, UNDER_REVIEW, ACCEPTED, REJECTED
}
