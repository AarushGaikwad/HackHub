package com.hackhub.responsedto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class TeamMemberResponseDto {

    private Integer userId;
    private String name;
    private String email;
    private boolean isLeader;

}
