package com.example.budgettracker.controller;

import com.example.budgettracker.dto.BudgetRequest;
import com.example.budgettracker.dto.BudgetResponse;
import com.example.budgettracker.service.BudgetService;
import com.example.budgettracker.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {
    
    private final BudgetService budgetService;
    private final JwtUtil jwtUtil;
    
    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(
            @Valid @RequestBody BudgetRequest request,
            @RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        BudgetResponse response = budgetService.createBudget(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getBudgets(
            @RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        List<BudgetResponse> budgets = budgetService.getUserBudgets(userId);
        return ResponseEntity.ok(budgets);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request,
            @RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        BudgetResponse response = budgetService.updateBudget(id, userId, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        budgetService.deleteBudget(id, userId);
        return ResponseEntity.noContent().build();
    }
    
    private Long extractUserIdFromToken(String token) {
        String bearerToken = token.replace("Bearer ", "");
        return jwtUtil.extractUserId(bearerToken);
    }
}
