package com.hackhub.service;

import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Service
public class PdfGeneratorService {

    public byte[] generateCertificate(String participantName, String hackathonName, String organizerName, String issuedDate) throws Exception {

        // Load HTML template from resources
        InputStream templateStream = getClass().getResourceAsStream("/templates/certificate-pdf.html");
        String html = new String(templateStream.readAllBytes(), StandardCharsets.UTF_8);

        // Replace placeholders with actual values
        html = html.replace("{{participantName}}", participantName);
        html = html.replace("{{hackathonName}}", hackathonName);
        html = html.replace("{{organizerName}}", organizerName);
        html = html.replace("{{issuedDate}}", issuedDate);

        // Generate PDF using OpenHtmlToPdf
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfRendererBuilder builder = new PdfRendererBuilder();

        // Register fonts which are used in the template (certificate-web.html)
        builder.useFont(
                () -> getClass().getResourceAsStream(
                        "/fonts/CormorantGaramond-Regular.ttf"),
                "Cormorant Garamond", 400,
                BaseRendererBuilder.FontStyle.NORMAL, true);

        builder.useFont(
                () -> getClass().getResourceAsStream(
                        "/fonts/CormorantGaramond-SemiBold.ttf"),
                "Cormorant Garamond", 600,
                BaseRendererBuilder.FontStyle.NORMAL, true);

        builder.useFont(
                () -> getClass().getResourceAsStream(
                        "/fonts/PlayfairDisplay-Regular.ttf"),
                "Playfair Display", 500,
                BaseRendererBuilder.FontStyle.NORMAL, true);

        builder.useFont(
                () -> getClass().getResourceAsStream(
                        "/fonts/PlayfairDisplay-Bold.ttf"),
                "Playfair Display", 700,
                BaseRendererBuilder.FontStyle.NORMAL, true);

        builder.useFont(
                () -> getClass().getResourceAsStream(
                        "/fonts/GreatVibes-Regular.ttf"),
                "Great Vibes", 400,
                BaseRendererBuilder.FontStyle.NORMAL, true);

        // Build PDF
        builder.withHtmlContent(html, null);
        builder.toStream(outputStream);
        builder.run();

        return outputStream.toByteArray();
    }
}
