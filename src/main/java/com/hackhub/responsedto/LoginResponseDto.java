package com.hackhub.responsedto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class LoginResponseDto {

    private String token;
    private Integer userId;
    private String name;
    private String email;
    private String role;
    private String status;
}
