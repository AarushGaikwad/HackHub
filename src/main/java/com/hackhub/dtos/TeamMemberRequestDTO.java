package com.hackhub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TeamMemberRequestDTO {

    private Integer teamId;   // FK reference
    private Integer userId;   // FK reference
}
