package com.hackhub.service;

import com.hackhub.entities.*;
import com.hackhub.repository.*;
import com.hackhub.responsedto.CertificateResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final HackathonRepository hackathonRepository;
    private final TeamRegistrationRepository teamRegistrationRepository;
    private final EvaluationRepository evaluationRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final PdfGeneratorService pdfGeneratorService;
    private final EmailService emailService;

    @Autowired
    public CertificateService(CertificateRepository certificateRepository,
                              HackathonRepository hackathonRepository,
                              TeamRegistrationRepository teamRegistrationRepository,
                              EvaluationRepository evaluationRepository,
                              UserRepository userRepository,
                              TeamMemberRepository teamMemberRepository,
                              PdfGeneratorService pdfGeneratorService,
                              EmailService emailService) {
        this.certificateRepository = certificateRepository;
        this.hackathonRepository = hackathonRepository;
        this.teamRegistrationRepository = teamRegistrationRepository;
        this.evaluationRepository = evaluationRepository;
        this.userRepository = userRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.pdfGeneratorService = pdfGeneratorService;
        this.emailService = emailService;
    }

    // Generate certificates for a hackathon
    public List<CertificateResponseDto> generateCertificates(Integer hackathonId, Integer organizerId) {

        // Validate hackathon exits
        Hackathon hackathon = hackathonRepository.findById(hackathonId).orElseThrow(
                () -> new RuntimeException("Hackathon not found with id: " + hackathonId));

        // Validate organizer
        User organizer = userRepository.findById(organizerId).orElseThrow(
                () -> new RuntimeException("User not found with id: " + organizerId));

        if (!"ORGANIZER".equalsIgnoreCase(organizer.getRole()))
            throw new RuntimeException("Only organizer can generate certificates");

        // Check hackathon is completed
        if (hackathon.getEndDate().isAfter(LocalDateTime.now()))
            throw new RuntimeException("Cannot generate certificates - hackathon has not ended yet");

        // Check evaluation exists
        List<Evaluation> evaluations = evaluationRepository.findByHackathonId(hackathonId);
        if (evaluations.isEmpty())
            throw new RuntimeException("Cannot generate certificates - no evaluations found");

        // Check certificates not already generated
        List<Certificate> existing = certificateRepository.findByHackathonId(hackathonId);
        if (!existing.isEmpty())
            throw new RuntimeException("Certificates already generated for this hackathon");

        // Get leaderboard - top 3 teams
        List<Object[]> leaderboard = evaluationRepository.findLeaderboardByHackathonId(hackathonId);
        if (leaderboard.isEmpty())
            throw new RuntimeException("Cannot generate certificates - leaderboard is empty");

        List<CertificateResponseDto> generatedCertificates = new ArrayList<>();
        String organizerName = organizer.getName();
        String issuedDate = LocalDate.now().toString();

        // Assign ranked certificates to top 3 teams
        String[] rankedTypes = {"WINNER","FIRST_RUNNER_UP","SECOND_RUNNER_UP"};
        for (int i = 0; i < Math.min(3, leaderboard.size()); i++) {
            String teamName = (String) leaderboard.get(i)[0];
            String certType = rankedTypes[i];

            // Find team registration for this hackathon
            List<TeamRegistration> registrations = teamRegistrationRepository.findByHackathonId(hackathonId);

            for (TeamRegistration registration : registrations) {
                if (registration.getTeam().getName().equals(teamName)) {
                    // Get all members of this team
                    List<TeamMember> members = teamMemberRepository.findByTeamId(registration.getTeam().getId());

                    for (TeamMember member : members) {
                        CertificateResponseDto cert = issueCertificate(member.getUser(), hackathon, certType, organizerName, issuedDate);
                        generatedCertificates.add(cert);
                    }
                }
            }
        }

        // Participation certificates for all remaining registered members
        List<TeamRegistration> allRegistrations = teamRegistrationRepository.findByHackathonId(hackathonId);

        for (TeamRegistration registration : allRegistrations) {
            List<TeamMember> members = teamMemberRepository.findByTeamId(registration.getTeam().getId());

            for (TeamMember member : members) {
                // Skip if already got a ranked certificate
                if (!certificateRepository.existsByUserIdAndHackathonIdAndType(
                        member.getUser().getId(), hackathonId, "WINNER") &&
                        !certificateRepository.existsByUserIdAndHackathonIdAndType(
                                member.getUser().getId(), hackathonId, "FIRST_RUNNER_UP") &&
                        !certificateRepository.existsByUserIdAndHackathonIdAndType(
                                member.getUser().getId(), hackathonId, "SECOND_RUNNER_UP")) {

                    CertificateResponseDto cert = issueCertificate(member.getUser(), hackathon, "PARTICIPATION", organizerName, issuedDate);
                    generatedCertificates.add(cert);
                }
            }
        }

        return generatedCertificates;
    }

    // Get all certificates for logged in participant
    public List<CertificateResponseDto> getMyCertificates(Integer userId) {
        userRepository.findById(userId).orElseThrow(() ->
                new RuntimeException("User not found with id: " + userId));

        return certificateRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }



    // Get all certificates for a hackathon
    public List<CertificateResponseDto> getHackathonCertificates(
            Integer hackathonId) {
        hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new RuntimeException(
                        "Hackathon not found with id: " + hackathonId));

        return certificateRepository.findByHackathonId(hackathonId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Download certificate as PDF
    public byte[] downloadCertificate(Integer certificateId) {
        Certificate certificate = certificateRepository.findById(certificateId).orElseThrow(
                () -> new RuntimeException("Certificate not found with id: " + certificateId));

        try {
            return pdfGeneratorService.generateCertificate(
                    certificate.getUser().getName(),
                    certificate.getHackathon().getTitle(),
                    certificate.getHackathon().getCreatedBy().getName(),
                    certificate.getIssuedAt().toLocalDate().toString(),
                    certificate.getType());
        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to generate certificate PDF: " + e.getMessage());
        }
    }

    private CertificateResponseDto issueCertificate(User user, Hackathon hackathon, String type, String organizerName, String issuedDate) {

        // Save certificate record
        Certificate certificate = Certificate.builder()
                .user(user)
                .hackathon(hackathon)
                .type(type)
                .issuedAt(LocalDateTime.now())
                .build();

        Certificate saved = certificateRepository.save(certificate);

        // Generate PDF
        try {
            byte[] pdfBytes = pdfGeneratorService.generateCertificate(
                    user.getName(),
                    hackathon.getTitle(),
                    organizerName,
                    issuedDate,
                    certificate.getType());

            // Send email with PDF attachment
            emailService.sendCertificateEmail(
                    user.getEmail(),
                    user.getName(),
                    hackathon.getTitle(),
                    pdfBytes);
        } catch (Exception e) {
            System.err.println("Failed to send certificate email to "
                    + user.getEmail() + ": " + e.getMessage());
        }

        return mapToResponse(saved);
    }

    // Get all certificates
    public List<CertificateResponseDto> getAllCertificates() {
        return certificateRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private CertificateResponseDto mapToResponse(Certificate certificate) {
        return CertificateResponseDto.builder()
                .id(certificate.getId())
                .participantName(certificate.getUser().getName())
                .hackathonTitle(certificate.getHackathon().getTitle())
                .organizationName(certificate.getHackathon()
                        .getOrganization().getName())
                .type(certificate.getType())
                .issuedAt(certificate.getIssuedAt())
                .build();
    }
}
