package com.hackhub.responsedto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class OrganizationResponseDto {

    private Integer id;
    private String name;
    private String type;
}