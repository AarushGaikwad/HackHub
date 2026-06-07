package com.hackhub.controller;

import com.hackhub.requestdto.UserRequestDto;
import com.hackhub.responsedto.UserResponseDto;
import com.hackhub.responsestatus.ResponseStatus;
import com.hackhub.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {

    private UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Register user
    @PostMapping("/register")
    public ResponseEntity<ResponseStatus<UserResponseDto>> registerUser(@RequestBody @Valid UserRequestDto userRequestDto){
        UserResponseDto userResponse = userService.registerUser(userRequestDto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ResponseStatus.success(userResponse));
    }

    // Get all users
    @GetMapping("/users")
    public ResponseEntity<ResponseStatus<List<UserResponseDto>>> getAllUsers(){
        List<UserResponseDto> responseList = userService.getAllUsers();
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ResponseStatus.success(responseList));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseStatus<UserResponseDto>> getUserById(@PathVariable int id) {
        UserResponseDto userResponse = userService.getUserById(id);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ResponseStatus.success(userResponse));
    }
}
