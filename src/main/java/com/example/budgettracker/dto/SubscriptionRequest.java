package com.example.budgettracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionRequest {

    @NotBlank(message = "Subscription name is required")
    private String name;

    @NotNull(message = "Monthly amount is required")
    @Positive(message = "Monthly amount must be positive")
    private BigDecimal monthlyAmount;

    @NotNull(message = "Next due date is required")
    private LocalDate nextDueDate;
}
