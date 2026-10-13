package com.example.budgettracker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "savings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Savings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    @Column(nullable = false)
    private BigDecimal amount;

    @NotBlank(message = "Destination is required")
    @Column(nullable = false)
    private String destination;

    // BANK, EWALLET, MARIBANK, or CUSTOM - used by the frontend to pick an icon/color
    @NotBlank(message = "Destination type is required")
    @Column(name = "destination_type", nullable = false)
    private String destinationType;

    // DEPOSIT (money moved into savings) or WITHDRAWAL (money taken out, e.g. to fund an expense)
    @Column(nullable = false, columnDefinition = "varchar(255) default 'DEPOSIT'")
    private String type;

    private String note;

    @NotNull(message = "Date is required")
    @Column(nullable = false)
    private LocalDate date;

    @ManyToOne(fetch = jakarta.persistence.FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (type == null) {
            type = "DEPOSIT";
        }
    }
}