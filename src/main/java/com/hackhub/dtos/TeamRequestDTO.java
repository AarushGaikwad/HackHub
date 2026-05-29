package com.hackhub.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TeamRequestDTO {

    private String name;
    private Integer hackathonId;   // FK reference
    private Integer leaderId;      // FK reference - team leader user
}
