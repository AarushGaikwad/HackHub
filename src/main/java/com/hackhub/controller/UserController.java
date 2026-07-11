package com.hackhub.controller;

import com.hackhub.requestdto.JudgeRequestDto;
import com.hackhub.requestdto.OrganizerRequestDto;
import com.hackhub.requestdto.ParticipantRequestDto;
import com.hackhub.requestdto.UserRequestDto;
import com.hackhub.responsedto.JudgeResponseDto;
import com.hackhub.responsedto.OrganizerResponseDto;
import com.hackhub.responsedto.ParticipantResponseDto;
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
@RequestMapping("/user/register")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // register participant
    @PostMapping("/participant")
    public ResponseEntity<ResponseStatus<ParticipantResponseDto>> registerParticipant(@RequestBody @Valid ParticipantRequestDto request) {
        ParticipantResponseDto response = userService.registerParticipant(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ResponseStatus.success(response));
    }

    // register organizer
    @PostMapping("/organizer")
    public ResponseEntity<ResponseStatus<OrganizerResponseDto>> registerOrganizer(@RequestBody @Valid OrganizerRequestDto request) {
        OrganizerResponseDto response = userService.registerOrganizer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ResponseStatus.success(response));
    }

    // register judge
    @PostMapping("/judge")
    public ResponseEntity<ResponseStatus<JudgeResponseDto>> registerJudge(@RequestBody @Valid JudgeRequestDto request) {
        JudgeResponseDto response = userService.registerJudge(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ResponseStatus.success(response));
    }

    // Get all user
    @GetMapping("/users")
    public ResponseEntity<ResponseStatus<List<UserResponseDto>>> getAllUsers() {
        List<UserResponseDto> response = userService.getAllUsers();
        return ResponseEntity.status(HttpStatus.OK).body(ResponseStatus.success(response));
    }
}
