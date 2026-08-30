package com.hackhub.chatbot;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class AiServiceImpl implements AiService {

    private static final int MAX_HISTORY_MESSAGES = 8;
    private static final int MAX_REQUESTS_PER_MINUTE = 8;
    private static final long ONE_MINUTE_IN_MS = 60_000L;

    private final AtomicInteger requestsThisWindow = new AtomicInteger(0);
    private final AtomicLong windowStart = new AtomicLong(System.currentTimeMillis());

    private final RestClient geminiRestClient;
    private final AiPromptBuilder promptBuilder;

    @Value("${gemini.api.model}")
    private String model;

    public AiServiceImpl(RestClient geminiRestClient, AiPromptBuilder promptBuilder) {
        this.geminiRestClient = geminiRestClient;
        this.promptBuilder = promptBuilder;
    }

    @Override
    public String handleCompanionChat(AiAssistRequest request, String userRole) {
        // 1. Input Validation
        if (request == null) {
            throw new IllegalArgumentException("AI request cannot be null.");
        }

        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException("Message cannot be empty.");
        }

        // 2. Local Rate Limiting Protection
        enforceRateLimit();

        // 3. Build Prompt and History Context
        String systemPrompt = promptBuilder.buildCompanionPrompt(userRole);
        List<AiChatMessage> history = request.getHistory() != null
                ? request.getHistory()
                : Collections.emptyList();

        // Sliding window: retain last N messages to optimize context token payload
        List<AiChatMessage> trimmedHistory = history.size() > MAX_HISTORY_MESSAGES
                ? history.subList(history.size() - MAX_HISTORY_MESSAGES, history.size())
                : history;

        Map<String, Object> requestBody = buildGeminiPayload(
                systemPrompt,
                trimmedHistory,
                request.getMessage()
        );

        // 4. Call Gemini RestClient with Exception Wrapping
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = geminiRestClient.post()
                    .uri("/models/{model}:generateContent", model)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            return extractText(response);

        } catch (HttpStatusCodeException ex) {
            int statusCode = ex.getStatusCode().value();

            if (statusCode == 429) {
                throw new AiServiceException(
                        "HackBot is receiving too many requests right now. Please try again shortly.",
                        429
                );
            }

            if (statusCode == 503) {
                throw new AiServiceException(
                        "HackBot is temporarily unavailable. Please try again in a few seconds.",
                        503
                );
            }

            throw new AiServiceException(
                    "HackBot could not process your request right now. Please try again.",
                    statusCode
            );
        }
    }

    /**
     * Lock-free thread-safe rate limiter resetting counters every 60 seconds.
     */
    private void enforceRateLimit() {
        long now = System.currentTimeMillis();
        long currentWindowStart = windowStart.get();

        if (now - currentWindowStart >= ONE_MINUTE_IN_MS) {
            if (windowStart.compareAndSet(currentWindowStart, now)) {
                requestsThisWindow.set(0);
            }
        }

        if (requestsThisWindow.incrementAndGet() > MAX_REQUESTS_PER_MINUTE) {
            throw new AiRateLimitException(
                    "HackBot is a bit busy right now. Please try again in a few seconds."
            );
        }
    }

    private Map<String, Object> buildGeminiPayload(String systemPrompt, List<AiChatMessage> history, String latestMessage) {
        List<Map<String, Object>> contents = new ArrayList<>();

        // Add sanitized history turns
        for (AiChatMessage message : history) {
            if (message == null || message.getContent() == null || message.getContent().trim().isEmpty()) {
                continue;
            }

            contents.add(Map.of(
                    "role", normalizeRole(message.getRole()),
                    "parts", List.of(Map.of("text", message.getContent().trim()))
            ));
        }

        // Add latest user prompt turn
        contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", latestMessage.trim()))
        ));

        return Map.of(
                "system_instruction", Map.of(
                        "parts", List.of(Map.of("text", systemPrompt))
                ),
                "contents", contents
        );
    }

    private String normalizeRole(String role) {
        if (role == null) {
            return "user";
        }

        String normalized = role.toLowerCase().trim();

        if ("assistant".equals(normalized) || "bot".equals(normalized) || "model".equals(normalized)) {
            return "model";
        }

        return "user";
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> response) {
        if (response == null) {
            throw new AiServiceException("HackBot returned an empty response.", 503);
        }

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
        if (candidates == null || candidates.isEmpty()) {
            throw new AiServiceException("HackBot could not generate a response.", 503);
        }

        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        if (content == null) {
            throw new AiServiceException("HackBot returned an invalid response.", 503);
        }

        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        if (parts == null || parts.isEmpty()) {
            throw new AiServiceException("HackBot returned no response text.", 503);
        }

        Object text = parts.get(0).get("text");
        if (text == null) {
            throw new AiServiceException("HackBot returned no response text.", 503);
        }

        return text.toString();
    }
}