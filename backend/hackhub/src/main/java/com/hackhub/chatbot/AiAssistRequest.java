package com.hackhub.chatbot;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AiAssistRequest {
    private AiMode mode;
    private String context;
    private List<AiChatMessage> history;
    private String message;
}
