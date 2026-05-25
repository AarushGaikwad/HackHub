package com.hackhub.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "submission")
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @Column(name = "title")
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "github_link")
    private String githubLink;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "status")
    private String status;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
}
