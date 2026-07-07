package com.hackhub.controller;

import com.hackhub.responsedto.CertificateResponseDto;
import com.hackhub.responsestatus.ResponseStatus;
import com.hackhub.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/certificate")
public class CertificateController {

    private final CertificateService certificateService;

    @Autowired
    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    // Generate certificates for a hackathon
    @PostMapping("/generate/{hackathonId}")
    public ResponseEntity<ResponseStatus<List<CertificateResponseDto>>> generateCertificates(@PathVariable Integer hackathonId,
                                                                                             @RequestParam Integer organizerId) {
        List<CertificateResponseDto> response = certificateService.generateCertificates(hackathonId, organizerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ResponseStatus.success(response));
    }

    // Get participant certificates
    @GetMapping("/my")
    public ResponseEntity<ResponseStatus<List<CertificateResponseDto>>> getMyCertificates(@RequestParam Integer userId) {
        List<CertificateResponseDto> response = certificateService
                .getMyCertificates(userId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Get all certificates for a hackathon
    @GetMapping("/hackathon/{hackathonId}")
    public ResponseEntity<ResponseStatus<List<CertificateResponseDto>>>
    getHackathonCertificates(@PathVariable Integer hackathonId) {
        List<CertificateResponseDto> response = certificateService
                .getHackathonCertificates(hackathonId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }

    // Download certificate as PDF
    @GetMapping("/{certificateId}/download")
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable Integer certificateId) {
        byte[] pdfBytes = certificateService.downloadCertificate(certificateId);
        return ResponseEntity
                .ok().header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=HackHub_Certificate.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
