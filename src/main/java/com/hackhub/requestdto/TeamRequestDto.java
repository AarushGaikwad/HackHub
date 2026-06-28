package com.hackhub.requestdto;

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
public class TeamRequestDto {

    @NotBlank(message = "Team name is required")
    private String name;


    @NotNull(message = "User ID is required")
    private Integer userId; // TODO: remove after JWT — extract from token
}
