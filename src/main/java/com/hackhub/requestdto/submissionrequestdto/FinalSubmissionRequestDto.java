package com.hackhub.requestdto.submissionrequestdto;

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
public class FinalSubmissionRequestDto {

    @NotNull(message = "Team Registration ID is required")
    private Integer teamRegistrationId;

    @NotNull(message = "User ID is required")
    private Integer userId; // TODO: remove after JWT

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "GitHub URL is required")
    private String githubUrl;

    // optional for final
    private String resourceUrl;
}
