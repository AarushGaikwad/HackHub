package com.hackhub.controller;

import com.hackhub.requestdto.HackathonRequestDto;
import com.hackhub.responsedto.HackathonResponseDto;
import com.hackhub.responsestatus.ResponseStatus;
import com.hackhub.service.HackathonService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hackathon")
public class HackathonController {

    private final HackathonService hackathonService;

    @Autowired
    public HackathonController(HackathonService hackathonService) {
        this.hackathonService = hackathonService;
    }

    @PostMapping("/create")
    public ResponseEntity<ResponseStatus<HackathonResponseDto>> createHackathon(
            @RequestBody @Valid HackathonRequestDto request) {

        HackathonResponseDto response =
                hackathonService.createHackathon(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ResponseStatus.success(response));
    }

    @GetMapping("/hackathons")
    public ResponseEntity<ResponseStatus<List<HackathonResponseDto>>> getAllHackathons() {

        List<HackathonResponseDto> response =
                hackathonService.getAllHackathons();

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ResponseStatus.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseStatus<HackathonResponseDto>> getHackathonById(
            @PathVariable Integer id) {

        HackathonResponseDto response =
                hackathonService.getHackathonById(id);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ResponseStatus.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseStatus<HackathonResponseDto>> updateHackathon(
            @PathVariable Integer id,
            @RequestBody @Valid HackathonRequestDto request) {

        HackathonResponseDto response =
                hackathonService.updateHackathon(id, request);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ResponseStatus.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseStatus<String>> deleteHackathon(
            @PathVariable Integer id) {

        hackathonService.deleteHackathon(id);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ResponseStatus.success("Hackathon deleted successfully"));
    }
    
    //Organizer API
    
    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<ResponseStatus<List<HackathonResponseDto>>>
    getHackathonsByOrganizer(
            @PathVariable Integer organizerId){

        return ResponseEntity.ok(
                ResponseStatus.success(
                        hackathonService
                                .getHackathonsByOrganizer(organizerId)
                )
        );
    }
    
    //Organization API
    
    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<ResponseStatus<List<HackathonResponseDto>>>
    getHackathonsByOrganization(
            @PathVariable Integer organizationId){

        return ResponseEntity.ok(
                ResponseStatus.success(
                        hackathonService
                                .getHackathonsByOrganization(organizationId)
                )
        );
    }
    
    //Search API
    
    @GetMapping("/search")
    public ResponseEntity<ResponseStatus<List<HackathonResponseDto>>>
    searchHackathons(
            @RequestParam String keyword){

        return ResponseEntity.ok(
                ResponseStatus.success(
                        hackathonService.searchHackathons(keyword)
                )
        );
    }
}
