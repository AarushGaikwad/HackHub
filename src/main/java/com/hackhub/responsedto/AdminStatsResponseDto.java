package com.hackhub.responsedto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class AdminStatsResponseDto {

    private Long totalUsers;
    private Long totalOrganizers;
    private Long pendingOrganizers;
    private Long totalHackathons;
    private Long activeHackathons;
    private Long upcomingHackathons;
    private Long completedHackathons;
    private Long totalTeams;
    private Long totalCertificatesIssued;
}
