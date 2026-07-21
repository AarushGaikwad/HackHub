package com.hackhub.controller;

import com.hackhub.requestdto.LoginRequestDto;
import com.hackhub.responsedto.LoginResponseDto;
import com.hackhub.responsestatus.ResponseStatus;
import com.hackhub.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LoginController {

    private final UserService userService;

    @Autowired
    public LoginController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseStatus<LoginResponseDto>> loginUser(@RequestBody @Valid LoginRequestDto request) {
        LoginResponseDto response = userService.loginUser(request);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }
}
