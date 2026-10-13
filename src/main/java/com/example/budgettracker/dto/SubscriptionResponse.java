package com.example.budgettracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponse {

    private Long id;
    private String name;
    private BigDecimal monthlyAmount;
    private LocalDate nextDueDate;
    private Long userId;
}
