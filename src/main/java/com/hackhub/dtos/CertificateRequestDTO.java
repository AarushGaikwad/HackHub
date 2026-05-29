package com.hackhub.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CertificateRequestDTO {

    private Integer userId;        // FK reference
    private Integer hackathonId;   // FK reference
    private String type;           // e.g. PARTICIPATION, WINNER, RUNNER_UP
}
