package com.hackhub.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Entity
@Table(name = "submission")
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_registration_id", nullable = false)
    private TeamRegistration teamRegistration;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by", nullable = false)
    private User submittedBy;

    @Column(name = "title")
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "resource_url")
    private String resourceUrl;

    // PROGRESS / FINAL
    @Column(name = "status")
    private String status;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
