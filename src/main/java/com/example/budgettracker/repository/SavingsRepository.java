package com.example.budgettracker.repository;

import com.example.budgettracker.entity.Savings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface SavingsRepository extends JpaRepository<Savings, Long> {
    List<Savings> findByUserIdOrderByDateDesc(Long userId);
    Optional<Savings> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT COALESCE(SUM(CASE WHEN s.type = 'WITHDRAWAL' THEN -s.amount ELSE s.amount END), 0) FROM Savings s WHERE s.user.id = :userId")
    BigDecimal getTotalSavingsByUser(@Param("userId") Long userId);
}