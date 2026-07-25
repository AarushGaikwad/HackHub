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
public class TeamResponseDto {

    private Integer id;
    private String name;
    private String leaderName;
    private String inviteCode;
    private Integer memberCount;
    private LocalDateTime createdAt;
}
