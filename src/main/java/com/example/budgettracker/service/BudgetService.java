package com.example.budgettracker.service;

import com.example.budgettracker.dto.BudgetRequest;
import com.example.budgettracker.dto.BudgetResponse;
import com.example.budgettracker.entity.Budget;
import com.example.budgettracker.entity.User;
import com.example.budgettracker.repository.BudgetRepository;
import com.example.budgettracker.repository.ExpenseRepository;
import com.example.budgettracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {
    
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    
    public BudgetResponse createBudget(Long userId, BudgetRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        Budget budget = new Budget();
        budget.setCategory(request.getCategory());
        budget.setLimitAmount(request.getLimitAmount());
        budget.setStartDate(request.getStartDate());
        budget.setEndDate(request.getEndDate());
        budget.setUser(user);
        
        Budget savedBudget = budgetRepository.save(budget);
        return convertToResponse(savedBudget, userId);
    }
    
    public List<BudgetResponse> getUserBudgets(Long userId) {
        return budgetRepository.findByUserId(userId).stream()
                .map(budget -> convertToResponse(budget, userId))
                .collect(Collectors.toList());
    }
    
    public BudgetResponse updateBudget(Long budgetId, Long userId, BudgetRequest request) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        
        budget.setCategory(request.getCategory());
        budget.setLimitAmount(request.getLimitAmount());
        budget.setStartDate(request.getStartDate());
        budget.setEndDate(request.getEndDate());
        
        Budget updatedBudget = budgetRepository.save(budget);
        return convertToResponse(updatedBudget, budget.getUser().getId());
    }
    
    public void deleteBudget(Long budgetId, Long userId) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        budgetRepository.delete(budget);
    }
    
    private BudgetResponse convertToResponse(Budget budget, Long userId) {
        // Only expenses paid from the balance count toward the budget;
        // expenses paid from savings are excluded.
        BigDecimal spent = expenseRepository
                .findByUserIdAndDateBetween(userId, budget.getStartDate(), budget.getEndDate())
                .stream()
                .filter(e -> !"SAVINGS".equalsIgnoreCase(e.getSource()))
                .map(e -> e.getAmount())
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return new BudgetResponse(
                budget.getId(),
                budget.getCategory(),
                budget.getLimitAmount(),
                spent,
                budget.getUser().getId(),
                budget.getStartDate(),
                budget.getEndDate()
        );
    }
}