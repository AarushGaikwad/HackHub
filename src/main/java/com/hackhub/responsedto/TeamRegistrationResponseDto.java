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
public class TeamRegistrationResponseDto {

    private Integer id;
    private Integer teamId;
    private String teamName;
    private Integer hackathonId;
    private String hackathonTitle;
    private String leaderName;
    private Integer memberCount;
    private String status;
    private String registeredBy;
    private LocalDateTime registeredAt;
}
