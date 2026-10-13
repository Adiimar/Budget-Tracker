package com.example.budgettracker.service;

import com.example.budgettracker.dto.SubscriptionRequest;
import com.example.budgettracker.dto.SubscriptionResponse;
import com.example.budgettracker.entity.Subscription;
import com.example.budgettracker.entity.User;
import com.example.budgettracker.repository.SubscriptionRepository;
import com.example.budgettracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public SubscriptionResponse createSubscription(Long userId, SubscriptionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Subscription subscription = new Subscription();
        applyRequest(subscription, request);
        subscription.setUser(user);
        return toResponse(subscriptionRepository.save(subscription));
    }

    public List<SubscriptionResponse> getUserSubscriptions(Long userId) {
        return subscriptionRepository.findByUserIdOrderByNextDueDateAsc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public SubscriptionResponse updateSubscription(Long id, Long userId, SubscriptionRequest request) {
        Subscription subscription = findSubscription(id, userId);
        applyRequest(subscription, request);
        return toResponse(subscriptionRepository.save(subscription));
    }

    @Transactional
    public SubscriptionResponse markPaid(Long id, Long userId) {
        Subscription subscription = findSubscription(id, userId);
        LocalDate dueDate = subscription.getNextDueDate();
        LocalDate nextMonth = dueDate.plusMonths(1);
        subscription.setNextDueDate(nextMonth.withDayOfMonth(
                Math.min(dueDate.getDayOfMonth(), nextMonth.lengthOfMonth())
        ));
        return toResponse(subscriptionRepository.save(subscription));
    }

    public void deleteSubscription(Long id, Long userId) {
        subscriptionRepository.delete(findSubscription(id, userId));
    }

    private Subscription findSubscription(Long id, Long userId) {
        return subscriptionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
    }

    private void applyRequest(Subscription subscription, SubscriptionRequest request) {
        subscription.setName(request.getName().trim());
        subscription.setMonthlyAmount(request.getMonthlyAmount());
        subscription.setNextDueDate(request.getNextDueDate());
    }

    private SubscriptionResponse toResponse(Subscription subscription) {
        return new SubscriptionResponse(
                subscription.getId(),
                subscription.getName(),
                subscription.getMonthlyAmount(),
                subscription.getNextDueDate(),
                subscription.getUser().getId()
        );
    }
}
