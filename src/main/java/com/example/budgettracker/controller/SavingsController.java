package com.example.budgettracker.controller;

import com.example.budgettracker.dto.SavingsRequest;
import com.example.budgettracker.dto.SavingsResponse;
import com.example.budgettracker.service.SavingsService;
import com.example.budgettracker.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/savings")
@RequiredArgsConstructor
public class SavingsController {

    private final SavingsService savingsService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<SavingsResponse> createSaving(
            @Valid @RequestBody SavingsRequest request,
            @RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        SavingsResponse response = savingsService.createSaving(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<SavingsResponse>> getSavings(
            @RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        List<SavingsResponse> savings = savingsService.getUserSavings(userId);
        return ResponseEntity.ok(savings);
    }

    @GetMapping("/total")
    public ResponseEntity<Map<String, BigDecimal>> getTotalSavings(
            @RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        BigDecimal total = savingsService.getTotalSavings(userId);
        return ResponseEntity.ok(Map.of("total", total));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSaving(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        savingsService.deleteSaving(id, userId);
        return ResponseEntity.noContent().build();
    }

    private Long extractUserIdFromToken(String token) {
        String bearerToken = token.replace("Bearer ", "");
        return jwtUtil.extractUserId(bearerToken);
    }
}