package com.hackhub.chatbot;

public class AiRateLimitException extends RuntimeException{
    public AiRateLimitException(String message){
        super(message);
    }
}
