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
public class CertificateResponseDto {

    private Integer id;
    private String participantName;
    private String hackathonTitle;
    private String organizationName;
    private String type;
    private LocalDateTime issuedAt;
}
