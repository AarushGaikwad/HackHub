package com.hackhub.requestdto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class HackathonRequestDto {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String rules;

    @NotNull(message = "Start Date is required")
    private LocalDateTime startDate;

    @NotNull(message = "End Date is required")
    private LocalDateTime endDate;

    @NotNull(message = "Organization Id is required")
    private Integer organizationId;

    @NotNull(message = "Created By is required")
    private Integer createdBy;

    @NotNull(message = "Max Team size is required")
    private Integer maxTeamSize;

    // optional - if the logic is not implemented then the default deadline will be 1 day before the hackathon starts
    private LocalDateTime registrationDeadline;
}