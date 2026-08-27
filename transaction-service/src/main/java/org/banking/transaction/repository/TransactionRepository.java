package org.banking.transaction.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.banking.transaction.model.TransactionStatus;
import org.banking.transaction.model.TransactionType;
import org.banking.transaction.model.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findTransactionByAccountId(String accountId);

    List<Transaction> findTransactionByAccountIdOrderByTransactionDateDesc(String accountId);

    List<Transaction> findTransactionByReferenceId(String referenceId);

    @Query("SELECT t FROM Transaction t WHERE t.accountId = :accountId " +
           "AND (:startDate IS NULL OR t.transactionDate >= :startDate) " +
           "AND (:endDate IS NULL OR t.transactionDate <= :endDate) " +
           "AND (:type IS NULL OR t.transactionType = :type) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "ORDER BY t.transactionDate DESC")
    List<Transaction> filterTransactions(
            @Param("accountId") String accountId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("type") TransactionType type,
            @Param("status") TransactionStatus status);
}