package com.hackhub.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TeamMemberResponseDTO {

    private Integer id;
    private TeamResponseDTO team;     // nested DTO
    private UserResponseDTO user;     // nested DTO
}
