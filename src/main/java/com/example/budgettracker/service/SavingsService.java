package com.example.budgettracker.service;

import com.example.budgettracker.dto.SavingsRequest;
import com.example.budgettracker.dto.SavingsResponse;
import com.example.budgettracker.entity.Savings;
import com.example.budgettracker.entity.User;
import com.example.budgettracker.repository.SavingsRepository;
import com.example.budgettracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavingsService {

    private final SavingsRepository savingsRepository;
    private final UserRepository userRepository;

    public SavingsResponse createSaving(Long userId, SavingsRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        Savings saving = new Savings();
        saving.setAmount(request.getAmount());
        saving.setDestination(request.getDestination());
        saving.setDestinationType(request.getDestinationType());
        saving.setType(request.getType() != null ? request.getType() : "DEPOSIT");
        saving.setNote(request.getNote());
        saving.setDate(request.getDate());
        saving.setUser(user);

        Savings savedSaving = savingsRepository.save(saving);
        return convertToResponse(savedSaving);
    }

    // Called when an expense is funded from savings instead of the regular balance.
    public SavingsResponse createWithdrawal(Long userId, BigDecimal amount, String destination,
                                             String destinationType, String note, LocalDate date) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        Savings withdrawal = new Savings();
        withdrawal.setAmount(amount);
        withdrawal.setDestination(destination);
        withdrawal.setDestinationType(destinationType);
        withdrawal.setType("WITHDRAWAL");
        withdrawal.setNote(note);
        withdrawal.setDate(date);
        withdrawal.setUser(user);

        Savings saved = savingsRepository.save(withdrawal);
        return convertToResponse(saved);
    }

    public List<SavingsResponse> getUserSavings(Long userId) {
        return savingsRepository.findByUserIdOrderByDateDesc(userId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public BigDecimal getTotalSavings(Long userId) {
        return savingsRepository.getTotalSavingsByUser(userId);
    }

    public void deleteSaving(Long savingId, Long userId) {
        Savings saving = savingsRepository.findByIdAndUserId(savingId, userId)
                .orElseThrow(() -> new RuntimeException("Savings entry not found"));
        savingsRepository.delete(saving);
    }

    private SavingsResponse convertToResponse(Savings saving) {
        return new SavingsResponse(
                saving.getId(),
                saving.getAmount(),
                saving.getDestination(),
                saving.getDestinationType(),
                saving.getType(),
                saving.getNote(),
                saving.getDate(),
                saving.getUser().getId()
        );
    }
}