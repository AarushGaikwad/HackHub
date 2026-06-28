package com.hackhub.responsedto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.*;


@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder

public class HackathonResponseDto {
	
	 private Integer id;

	    private String title;
	    private String description;
	    private String rules;
	    private LocalDateTime startDate;
	    private LocalDateTime endDate;
	    private String organizationName;
	    private String organizerName;
		private Integer maxTeamSize;
		private LocalDateTime registrationDeadline;
}
