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
public class ParticipantResponseDto {
    private Integer id;
    private String name;
    private String email;
    private String collegeName;
    private String role;
    private String status;
    private LocalDateTime createdAt;
}
