package com.hackhub.chatbot;

import com.hackhub.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AiController {

    private final AiService aiService;

    @Autowired
    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/assist")
    @PreAuthorize("isAuthenticated()")
    public String assist(@RequestBody AiAssistRequest request) {
        String userRole = SecurityUtils.getCurrentUserRole();

        return switch (request.getMode()) {
            case COMPANION_CHAT -> aiService.handleCompanionChat(request, userRole);
            case DESCRIBE_HACKATHON -> "describe hackathon not yet implemented";
            case SUBMISSION_FEEDBACK -> "submission feedback not yet implemented";
        };
    }
}
