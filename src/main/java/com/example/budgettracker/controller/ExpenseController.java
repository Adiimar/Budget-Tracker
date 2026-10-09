package com.example.budgettracker.controller;

import com.example.budgettracker.dto.ExpenseRequest;
import com.example.budgettracker.dto.ExpenseResponse;
import com.example.budgettracker.service.ExpenseService;
import com.example.budgettracker.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {
    
    private final ExpenseService expenseService;
    private final JwtUtil jwtUtil;
    
    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @Valid @RequestBody ExpenseRequest request,
            @RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        ExpenseResponse response = expenseService.createExpense(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getExpenses(
            @RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        List<ExpenseResponse> expenses = expenseService.getUserExpenses(userId);
        return ResponseEntity.ok(expenses);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> getExpenseById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        ExpenseResponse expense = expenseService.getExpenseById(id, userId);
        return ResponseEntity.ok(expense);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request,
            @RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        ExpenseResponse response = expenseService.updateExpense(id, userId, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        expenseService.deleteExpense(id, userId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/range")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        List<ExpenseResponse> expenses = expenseService.getExpensesByDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(expenses);
    }
    
    private Long extractUserIdFromToken(String token) {
        String bearerToken = token.replace("Bearer ", "");
        return jwtUtil.extractUserId(bearerToken);
    }
}
