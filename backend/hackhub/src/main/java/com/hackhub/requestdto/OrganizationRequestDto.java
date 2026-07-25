package com.hackhub.requestdto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class OrganizationRequestDto {

    @NotBlank(message = "Organization name is required")
    private String name;

    @NotBlank(message = "Organization type is required")
    private String type;
}