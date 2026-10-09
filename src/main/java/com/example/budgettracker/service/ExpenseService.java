package com.example.budgettracker.service;

import com.example.budgettracker.dto.ExpenseRequest;
import com.example.budgettracker.dto.ExpenseResponse;
import com.example.budgettracker.entity.Expense;
import com.example.budgettracker.entity.User;
import com.example.budgettracker.repository.ExpenseRepository;
import com.example.budgettracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final SavingsService savingsService;

    @Transactional
    public ExpenseResponse createExpense(Long userId, ExpenseRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        String source = request.getSource() != null ? request.getSource().toUpperCase() : "BALANCE";

        if ("SAVINGS".equals(source)
                && (request.getSavingsDestination() == null || request.getSavingsDestination().isBlank())) {
            throw new RuntimeException("Savings destination is required when deducting from savings");
        }

        Expense expense = new Expense();
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setDate(request.getDate());
        expense.setUser(user);
        expense.setSource(source);
        expense.setSavingsDestination(request.getSavingsDestination());
        expense.setSavingsDestinationType(request.getSavingsDestinationType());

        Expense savedExpense = expenseRepository.save(expense);

        // If this expense is funded from savings, record a matching withdrawal
        if ("SAVINGS".equals(source)) {
            savingsService.createWithdrawal(
                    userId,
                    request.getAmount(),
                    request.getSavingsDestination(),
                    request.getSavingsDestinationType(),
                    "Expense: " + request.getDescription(),
                    request.getDate()
            );
        }

        return convertToResponse(savedExpense);
    }

    public List<ExpenseResponse> getUserExpenses(Long userId) {
        return expenseRepository.findByUserId(userId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public ExpenseResponse getExpenseById(Long expenseId, Long userId) {
        Expense expense = expenseRepository.findByIdAndUserId(expenseId, userId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        return convertToResponse(expense);
    }

    public ExpenseResponse updateExpense(Long expenseId, Long userId, ExpenseRequest request) {
        Expense expense = expenseRepository.findByIdAndUserId(expenseId, userId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setDate(request.getDate());

        Expense updatedExpense = expenseRepository.save(expense);
        return convertToResponse(updatedExpense);
    }

    public void deleteExpense(Long expenseId, Long userId) {
        Expense expense = expenseRepository.findByIdAndUserId(expenseId, userId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        expenseRepository.delete(expense);
    }

    public List<ExpenseResponse> getExpensesByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private ExpenseResponse convertToResponse(Expense expense) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getAmount(),
                expense.getCategory(),
                expense.getDescription(),
                expense.getDate(),
                expense.getUser().getId(),
                expense.getSource(),
                expense.getSavingsDestination(),
                expense.getSavingsDestinationType()
        );
    }
}