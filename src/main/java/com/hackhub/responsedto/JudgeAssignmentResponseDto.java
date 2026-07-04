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
public class JudgeAssignmentResponseDto {

    private Integer id;
    private Integer hackathonId;
    private String hackathonTitle;
    private Integer judgeId;
    private String judgeName;
    private String judgeEmail;
    private String assignedByName;
    private String status;
    private LocalDateTime assignedAt;
}
