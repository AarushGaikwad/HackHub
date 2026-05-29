package com.hackhub.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRequestDTO {

    private String name;
    private String email;
    private String password;
    private String role;        // e.g. PARTICIPANT, JUDGE, ADMIN
    private String designation;
    private String status;      // e.g. ACTIVE, INACTIVE
}
