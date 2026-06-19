package com.hackhub.exception;

import com.hackhub.responsestatus.ResponseStatus;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handles @Valid validation failures (e.g. @NotBlank, @Email)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseStatus<Object>> handleValidationException(MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult().getFieldErrors().stream().map(FieldError::getDefaultMessage).collect(Collectors.joining(", "));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseStatus.error(message));
    }

    // Handles all custom business logic exceptions (RuntimeException)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ResponseStatus<Object>> handleRuntimeException(RuntimeException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseStatus.error(ex.getMessage()));
    }

    // Catches anything else unexpected (NullPointerException, etc.)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseStatus<Object>> handleGenericException(Exception ex) {

        ex.printStackTrace();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ResponseStatus.error("Something went wrong. Please try again later."));
    }
}
