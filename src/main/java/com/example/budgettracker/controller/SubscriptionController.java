package com.example.budgettracker.controller;

import com.example.budgettracker.dto.SubscriptionRequest;
import com.example.budgettracker.dto.SubscriptionResponse;
import com.example.budgettracker.service.SubscriptionService;
import com.example.budgettracker.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<SubscriptionResponse> createSubscription(
            @Valid @RequestBody SubscriptionRequest request,
            @RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(subscriptionService.createSubscription(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionResponse>> getSubscriptions(
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(subscriptionService.getUserSubscriptions(extractUserId(token)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionResponse> updateSubscription(
            @PathVariable Long id,
            @Valid @RequestBody SubscriptionRequest request,
            @RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        return ResponseEntity.ok(subscriptionService.updateSubscription(id, userId, request));
    }

    @PostMapping("/{id}/paid")
    public ResponseEntity<SubscriptionResponse> markPaid(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        return ResponseEntity.ok(subscriptionService.markPaid(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubscription(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        subscriptionService.deleteSubscription(id, extractUserId(token));
        return ResponseEntity.noContent().build();
    }

    private Long extractUserId(String token) {
        return jwtUtil.extractUserId(token.replace("Bearer ", ""));
    }
}
