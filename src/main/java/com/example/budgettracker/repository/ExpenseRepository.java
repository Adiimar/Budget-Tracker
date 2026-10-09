package com.example.budgettracker.repository;

import com.example.budgettracker.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUserId(Long userId);
    Optional<Expense> findByIdAndUserId(Long id, Long userId);
    List<Expense> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    List<Expense> findByUserIdAndCategory(Long userId, String category);

    // The sums below exclude expenses paid from savings, so they only
    // count against the budget / remaining balance.

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.source <> 'SAVINGS' AND YEAR(e.date) = :year AND MONTH(e.date) = :month")
    BigDecimal getSumByUserAndMonth(@Param("userId") Long userId, @Param("year") int year, @Param("month") int month);

    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.source <> 'SAVINGS' AND YEAR(e.date) = :year AND MONTH(e.date) = :month GROUP BY e.category")
    List<Object[]> getSumByCategory(@Param("userId") Long userId, @Param("year") int year, @Param("month") int month);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.source <> 'SAVINGS' AND e.category = :category AND e.date BETWEEN :startDate AND :endDate")
    BigDecimal getSumByUserAndCategoryAndDateRange(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.source <> 'SAVINGS' AND e.date BETWEEN :startDate AND :endDate")
    BigDecimal getSumByUserAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}