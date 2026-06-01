package com.hackhub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrganizationRequestDTO {

    private String name;
    private String type;    // e.g. COLLEGE, COMPANY, NGO
}
