package org.banking.transaction.service.implementation;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import org.banking.transaction.exception.AccountStatusException;
import org.banking.transaction.exception.GlobalErrorCode;
import org.banking.transaction.exception.InsufficientBalance;
import org.banking.transaction.exception.ResourceNotFound;
import org.banking.transaction.external.AccountService;
import org.banking.transaction.model.TransactionStatus;
import org.banking.transaction.model.TransactionType;
import org.banking.transaction.model.dto.MonthlySummaryDto;
import org.banking.transaction.model.dto.TransactionDto;
import org.banking.transaction.model.dto.TransactionSummaryDto;
import org.banking.transaction.model.entity.Transaction;
import org.banking.transaction.model.external.Account;
import org.banking.transaction.model.mapper.TransactionMapper;
import org.banking.transaction.model.response.Response;
import org.banking.transaction.model.response.TransactionRequest;
import org.banking.transaction.repository.TransactionRepository;
import org.banking.transaction.service.TransactionService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountService accountService;

    private final TransactionMapper transactionMapper = new TransactionMapper();

    @Value("${spring.application.ok:200}")
    private String ok;

    @Override
    @Caching(evict = {
        @CacheEvict(value = "transactionsByAccount", key = "#transactionDto.accountId"),
        @CacheEvict(value = "transactionsByReference", allEntries = true)
    })
    public Response addTransaction(TransactionDto transactionDto) {

        ResponseEntity<Account> response = getAccountWithResilience(transactionDto.getAccountId());
        if (Objects.isNull(response) || Objects.isNull(response.getBody())) {
            throw new ResourceNotFound("Requested account not found on the server", GlobalErrorCode.NOT_FOUND);
        }

        Account account = response.getBody();
        Transaction transaction = transactionMapper.convertToEntity(transactionDto);

        if (TransactionType.DEPOSIT.toString().equalsIgnoreCase(transactionDto.getTransactionType())) {

            account.setAvailableBalance(account.getAvailableBalance().add(transactionDto.getAmount()));
            transaction.setAmount(transactionDto.getAmount());

        } else if (TransactionType.WITHDRAWAL.toString().equalsIgnoreCase(transactionDto.getTransactionType())) {

            if (!"ACTIVE".equalsIgnoreCase(account.getAccountStatus())) {
                throw new AccountStatusException("account is inactive or closed");
            }

            if (account.getAvailableBalance().compareTo(transactionDto.getAmount()) < 0) {
                throw new InsufficientBalance("Insufficient balance in the account");
            }

            transaction.setAmount(transactionDto.getAmount().negate());
            account.setAvailableBalance(account.getAvailableBalance().subtract(transactionDto.getAmount()));
        }

        transaction.setTransactionType(TransactionType.valueOf(transactionDto.getTransactionType().toUpperCase()));
        transaction.setComments(transactionDto.getDescription());
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setReferenceId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        updateAccountWithResilience(transactionDto.getAccountId(), account);

        transactionRepository.save(transaction);

        return Response.builder()
                .message("Transaction completed successfully")
                .responseCode(ok)
                .build();
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "transactionsByAccount", allEntries = true),
        @CacheEvict(value = "transactionsByReference", allEntries = true)
    })
    public Response internalTransaction(List<TransactionDto> transactionDtos, String transactionReference) {

        List<Transaction> transactions = transactionMapper.convertToEntityList(transactionDtos);

        transactions.forEach(transaction -> {
            transaction.setTransactionType(TransactionType.INTERNAL_TRANSFER);
            transaction.setStatus(TransactionStatus.COMPLETED);
            transaction.setReferenceId(transactionReference);
        });

        transactionRepository.saveAll(transactions);

        return Response.builder()
                .responseCode(ok)
                .message("Transaction completed successfully").build();
    }

    @Override
    @Cacheable(value = "transactionsByAccount", key = "#accountId")
    public List<TransactionRequest> getTransaction(String accountId) {

        return transactionRepository.findTransactionByAccountIdOrderByTransactionDateDesc(accountId)
                .stream().map(this::mapToTransactionRequest)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "transactionsByReference", key = "#transactionReference")
    public List<TransactionRequest> getTransactionByTransactionReference(String transactionReference) {

        return transactionRepository.findTransactionByReferenceId(transactionReference)
                .stream().map(this::mapToTransactionRequest)
                .collect(Collectors.toList());
    }

    @Override
    public List<TransactionRequest> filterTransactions(String accountId, String startDate, String endDate, String type, String status) {
        log.info("Filtering transactions for accountId: {}, startDate: {}, endDate: {}, type: {}, status: {}",
                accountId, startDate, endDate, type, status);

        LocalDateTime start = null;
        if (startDate != null && !startDate.trim().isEmpty()) {
            start = LocalDate.parse(startDate.trim()).atStartOfDay();
        }

        LocalDateTime end = null;
        if (endDate != null && !endDate.trim().isEmpty()) {
            end = LocalDate.parse(endDate.trim()).atTime(LocalTime.MAX);
        }

        TransactionType txnType = null;
        if (type != null && !type.trim().isEmpty() && !type.equalsIgnoreCase("ALL")) {
            try {
                txnType = TransactionType.valueOf(type.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid transaction type filter: {}", type);
            }
        }

        TransactionStatus txnStatus = null;
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
            try {
                txnStatus = TransactionStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid transaction status filter: {}", status);
            }
        }

        return transactionRepository.filterTransactions(accountId, start, end, txnType, txnStatus)
                .stream().map(this::mapToTransactionRequest)
                .collect(Collectors.toList());
    }

    @Override
    public TransactionSummaryDto getAccountSummary(String accountId) {
        log.info("Computing dashboard account summary for accountId: {}", accountId);

        List<Transaction> allTransactions = transactionRepository.findTransactionByAccountIdOrderByTransactionDateDesc(accountId);

        BigDecimal totalCredited = BigDecimal.ZERO;
        BigDecimal totalDebited = BigDecimal.ZERO;

        for (Transaction txn : allTransactions) {
            if (txn.getAmount() != null) {
                if (txn.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                    totalCredited = totalCredited.add(txn.getAmount());
                } else {
                    totalDebited = totalDebited.add(txn.getAmount().abs());
                }
            }
        }

        List<TransactionRequest> recent = allTransactions.stream()
                .limit(5)
                .map(this::mapToTransactionRequest)
                .collect(Collectors.toList());

        Map<String, List<Transaction>> byMonth = allTransactions.stream()
                .filter(t -> t.getTransactionDate() != null)
                .collect(Collectors.groupingBy(t ->
                        t.getTransactionDate().format(DateTimeFormatter.ofPattern("MMM yyyy")),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<MonthlySummaryDto> monthlySummary = new ArrayList<>();
        for (Map.Entry<String, List<Transaction>> entry : byMonth.entrySet()) {
            BigDecimal mCredit = BigDecimal.ZERO;
            BigDecimal mDebit = BigDecimal.ZERO;
            int year = entry.getValue().get(0).getTransactionDate().getYear();

            for (Transaction t : entry.getValue()) {
                if (t.getAmount() != null) {
                    if (t.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                        mCredit = mCredit.add(t.getAmount());
                    } else {
                        mDebit = mDebit.add(t.getAmount().abs());
                    }
                }
            }

            monthlySummary.add(MonthlySummaryDto.builder()
                    .month(entry.getKey())
                    .year(year)
                    .totalCredit(mCredit)
                    .totalDebit(mDebit)
                    .count(entry.getValue().size())
                    .build());
        }

        return TransactionSummaryDto.builder()
                .accountId(accountId)
                .totalCredited(totalCredited)
                .totalDebited(totalDebited)
                .totalTransactions(allTransactions.size())
                .recentTransactions(recent)
                .monthlySummary(monthlySummary)
                .build();
    }

    private TransactionRequest mapToTransactionRequest(Transaction transaction) {
        TransactionRequest transactionRequest = new TransactionRequest();
        BeanUtils.copyProperties(transaction, transactionRequest);
        if (transaction.getStatus() != null) {
            transactionRequest.setTransactionStatus(transaction.getStatus().toString());
        }
        transactionRequest.setLocalDateTime(transaction.getTransactionDate());
        if (transaction.getTransactionType() != null) {
            transactionRequest.setTransactionType(transaction.getTransactionType().toString());
        }
        return transactionRequest;
    }

    @CircuitBreaker(name = "accountService", fallbackMethod = "accountServiceReadFallback")
    @Retry(name = "accountService")
    @RateLimiter(name = "accountService")
    public ResponseEntity<Account> getAccountWithResilience(String accountId) {
        return accountService.readByAccountNumber(accountId);
    }

    public ResponseEntity<Account> accountServiceReadFallback(String accountId, Throwable ex) {
        log.error("Fallback triggered for readByAccountNumber. AccountId = {}, Error = {}", accountId, ex.toString());
        return ResponseEntity.status(503).body(null);
    }

    @CircuitBreaker(name = "accountService", fallbackMethod = "accountServiceUpdateFallback")
    @Retry(name = "accountService")
    @RateLimiter(name = "accountService")
    public void updateAccountWithResilience(String accountId, Account account) {
        accountService.updateAccount(accountId, account);
    }

    public void accountServiceUpdateFallback(String accountId, Account account, Throwable ex) {
        log.error("Fallback triggered for updateAccount. AccountId = {}, Error = {}", accountId, ex.toString());
        throw new RuntimeException("Account service unavailable. Cannot update account.");
    }
}