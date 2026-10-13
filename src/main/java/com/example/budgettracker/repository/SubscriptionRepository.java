package com.example.budgettracker.repository;

import com.example.budgettracker.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findByUserIdOrderByNextDueDateAsc(Long userId);

    Optional<Subscription> findByIdAndUserId(Long id, Long userId);
}
