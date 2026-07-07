package com.hackhub.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String fromEmail;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // Test method to send the dummy email
    public void sendTestEmail(String toEmail) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("HackHub — Test Email");
        message.setText("Hey! This is a test email from HackHub.");

        mailSender.send(message);
    }

    // Sent email with generated PDF attached in the body
    public void sendCertificateEmail(String toEmail, String participantName, String hackathonName, byte[] pdfBytes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true,"UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Congratulations! Your Hackathon Certificate is Ready");
            helper.setText("Dear " + participantName + ",\n\n" +
                    "Your certificate for\n\n" +
                    hackathonName + "\n\n" +
                    "has been generated.\n\n" +
                    "Please find your certificate attached to this email.\n" +
                    "You can also download it anytime from your HackHub dashboard.\n\n" +
                    "Regards,\n" +
                    "HackHub Team");

            // Attach the PDF
            helper.addAttachment("HackHub_Certificate.pdf", new ByteArrayResource(pdfBytes));

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send certificate email: " + e.getMessage());
        }
    }
}
