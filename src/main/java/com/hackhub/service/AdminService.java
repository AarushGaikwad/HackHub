package com.hackhub.service;

import com.hackhub.entities.Hackathon;
import com.hackhub.repository.CertificateRepository;
import com.hackhub.repository.HackathonRepository;
import com.hackhub.repository.TeamRepository;
import com.hackhub.repository.UserRepository;
import com.hackhub.responsedto.AdminStatsResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final HackathonRepository hackathonRepository;
    private final TeamRepository teamRepository;
    private final CertificateRepository certificateRepository;

    @Autowired
    public AdminService(UserRepository userRepository,
                        HackathonRepository hackathonRepository,
                        TeamRepository teamRepository,
                        CertificateRepository certificateRepository) {
        this.userRepository = userRepository;
        this.hackathonRepository = hackathonRepository;
        this.teamRepository = teamRepository;
        this.certificateRepository = certificateRepository;
    }

    // Platform overview stats
    public AdminStatsResponseDto getOverviewStats() {

        LocalDateTime now = LocalDateTime.now();

        long totalUsers = userRepository.count();
        long totalOrganizers = userRepository.findByRole("ORGANIZER").size();
        long pendingOrganizers = userRepository.findAll()
                .stream()
                .filter(u -> "ORGANIZER".equalsIgnoreCase(u.getRole())
                        && "PENDING".equalsIgnoreCase(u.getStatus()))
                .count();

        List<Hackathon> allHackathons = hackathonRepository.findAll();
        long totalHackathons = allHackathons.size();
        long activeHackathons = allHackathons.stream()
                .filter(h -> h.getStartDate().isBefore(now)
                        && h.getEndDate().isAfter(now))
                .count();
        long upcomingHackathons = allHackathons.stream()
                .filter(h -> h.getStartDate().isAfter(now))
                .count();
        long completedHackathons = allHackathons.stream()
                .filter(h -> h.getEndDate().isBefore(now))
                .count();

        long totalTeams = teamRepository.count();
        long totalCertificates = certificateRepository.count();

        return AdminStatsResponseDto.builder()
                .totalUsers(totalUsers)
                .totalOrganizers(totalOrganizers)
                .pendingOrganizers(pendingOrganizers)
                .totalHackathons(totalHackathons)
                .activeHackathons(activeHackathons)
                .upcomingHackathons(upcomingHackathons)
                .completedHackathons(completedHackathons)
                .totalTeams(totalTeams)
                .totalCertificatesIssued(totalCertificates)
                .build();
    }
}
