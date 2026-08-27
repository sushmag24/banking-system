package org.banking.account.service.implementation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import org.banking.account.exception.*;
import org.banking.account.external.SequenceService;
import org.banking.account.external.TransactionService;
import org.banking.account.external.UserService;
import org.banking.account.model.AccountStatus;
import org.banking.account.model.AccountType;
import org.banking.account.model.dto.AccountDto;
import org.banking.account.model.dto.AccountStatusUpdate;
import org.banking.account.model.dto.external.UserDto;
import org.banking.account.model.dto.response.Response;
import org.banking.account.model.entity.Account;
import org.banking.account.model.mapper.AccountMapper;
import org.banking.account.model.dto.external.TransactionResponse;
import org.banking.account.repository.AccountRepository;
import org.banking.account.service.AccountService;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

import static org.banking.account.model.Constants.ACC_PREFIX;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountServiceImpl implements AccountService {

    private final UserService userService;
    private final SequenceService sequenceService;
    private final TransactionService transactionService;
    private final AccountRepository accountRepository;

    private final AccountMapper accountMapper = new AccountMapper();

    @Value("${spring.application.ok:200}")
    private String success;

    @Override
    public Response createAccount(AccountDto accountDto) {

        try {
            UserDto user = getUserByIdWithResilience(accountDto.getUserId());
            if (user == null) {
                log.warn("User lookup returned null for userId {}, proceeding with local validation", accountDto.getUserId());
            }
        } catch (Exception e) {
            log.warn("User service unavailable, proceeding with account creation: {}", e.getMessage());
        }

        accountRepository.findAccountByUserIdAndAccountType(
                accountDto.getUserId(),
                AccountType.valueOf(accountDto.getAccountType().toUpperCase())
        ).ifPresent(account -> {
            throw new ResourceConflict("Account of type " + accountDto.getAccountType() + " already exists for this user");
        });

        Account account = accountMapper.convertToEntity(accountDto);

        Long nextSeq;
        try {
            nextSeq = getNextSequenceWithResilience();
        } catch (Exception e) {
            log.warn("Sequence generator fallback to random sequence: {}", e.getMessage());
            nextSeq = (long) (1000000 + new Random().nextInt(9000000));
        }

        account.setAccountNumber(
                ACC_PREFIX + String.format("%07d", nextSeq)
        );

        account.setAccountStatus(AccountStatus.ACTIVE);
        account.setAvailableBalance(accountDto.getAccountBalance() != null ? accountDto.getAccountBalance() : BigDecimal.ZERO);
        account.setAccountType(AccountType.valueOf(accountDto.getAccountType().toUpperCase()));

        Account saved = accountRepository.save(account);
        log.info("Created new account: {} for userId: {}", saved.getAccountNumber(), saved.getUserId());

        return Response.builder()
                .responseCode(success)
                .message("Account created successfully with Account Number: " + saved.getAccountNumber())
                .build();
    }

    @CircuitBreaker(name = "userService", fallbackMethod = "userFallback")
    @Retry(name = "userService")
    @RateLimiter(name = "userService")
    public UserDto getUserByIdWithResilience(Long userId) {
        ResponseEntity<UserDto> response = userService.readUserById(userId);
        return response != null ? response.getBody() : null;
    }

    public UserDto userFallback(Long userId, Throwable ex) {
        log.error("User-service fallback triggered. Reason = {}", ex.toString());
        return null;
    }

    @CircuitBreaker(name = "sequenceService", fallbackMethod = "sequenceFallback")
    @Retry(name = "sequenceService")
    @RateLimiter(name = "sequenceService")
    public Long getNextSequenceWithResilience() {
        return sequenceService.generateAccountNumber().getAccountNumber();
    }

    public Long sequenceFallback(Throwable ex) {
        log.error("Sequence-service fallback triggered. Generating fallback sequence. Reason = {}", ex.toString());
        return (long) (1000000 + new Random().nextInt(9000000));
    }

    @Override
    @CacheEvict(value = "accounts", key = "#accountNumber")
    public Response updateStatus(String accountNumber, AccountStatusUpdate accountUpdate) {
        return accountRepository.findAccountByAccountNumber(accountNumber)
                .map(account -> {
                    account.setAccountStatus(accountUpdate.getAccountStatus());
                    accountRepository.save(account);
                    return Response.builder().message("Account status updated to " + accountUpdate.getAccountStatus()).responseCode(success).build();
                }).orElseThrow(() -> new ResourceNotFound("Account not found on the server"));
    }

    @Override
    @Cacheable(value = "accounts", key = "#accountNumber", unless = "#result == null or #result.accountStatus.equals('CLOSED')")
    public AccountDto readAccountByAccountNumber(String accountNumber) {

        return accountRepository.findAccountByAccountNumber(accountNumber)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFound("Account not found with number: " + accountNumber));
    }

    @Override
    @CacheEvict(value = "accounts", key = "#accountNumber")
    public Response updateAccount(String accountNumber, AccountDto accountDto) {

        return accountRepository.findAccountByAccountNumber(accountNumber)
                .map(account -> {
                    if (accountDto.getAccountBalance() != null) {
                        account.setAvailableBalance(accountDto.getAccountBalance());
                    } else if (accountDto.getAvailableBalance() != null) {
                        account.setAvailableBalance(accountDto.getAvailableBalance());
                    }
                    if (accountDto.getAccountStatus() != null) {
                        account.setAccountStatus(AccountStatus.valueOf(accountDto.getAccountStatus().toUpperCase()));
                    }
                    accountRepository.save(account);
                    return Response.builder()
                            .responseCode(success)
                            .message("Account updated successfully").build();
                }).orElseThrow(() -> new ResourceNotFound("Account not found on the server"));
    }

    @Override
    public String getBalance(String accountNumber) {

        return accountRepository.findAccountByAccountNumber(accountNumber)
                .map(account -> account.getAvailableBalance().toString())
                .orElseThrow(() -> new ResourceNotFound("Account not found with number: " + accountNumber));
    }

    @Override
    @CircuitBreaker(name = "transactionService", fallbackMethod = "transactionFallback")
    @Retry(name = "transactionService")
    @RateLimiter(name = "transactionService")
    public List<TransactionResponse> getTransactionsFromAccountId(String accountId) {

        try {
            return transactionService.getTransactionsFromAccountId(accountId);
        } catch (Exception e) {
            log.warn("Could not fetch transactions from transaction service: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<TransactionResponse> transactionFallback(String accountId, Throwable ex) {
        log.error("Transaction service fallback for account {}: {}", accountId, ex.toString());
        return new ArrayList<>();
    }

    @Override
    @CacheEvict(value = "accounts", key = "#accountNumber")
    public Response closeAccount(String accountNumber) {

        return accountRepository.findAccountByAccountNumber(accountNumber)
                .map(account -> {
                    if (account.getAvailableBalance() != null && account.getAvailableBalance().compareTo(BigDecimal.ZERO) != 0) {
                        throw new AccountClosingException("Account balance must be zero before closing");
                    }
                    account.setAccountStatus(AccountStatus.CLOSED);
                    accountRepository.save(account);
                    return Response.builder()
                            .message("Account closed successfully")
                            .responseCode(success)
                            .build();
                }).orElseThrow(() -> new ResourceNotFound("Account not found on the server"));

    }

    @Override
    public AccountDto readAccountByUserId(Long userId) {

        return accountRepository.findAccountByUserId(userId)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFound("No account found for user ID: " + userId));
    }

    @Override
    public List<AccountDto> readAccountsByUserId(Long userId) {
        return accountRepository.findAllByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AccountDto> readAllAccounts() {
        return accountRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private AccountDto mapToDto(Account account) {
        AccountDto accountDto = accountMapper.convertToDto(account);
        accountDto.setAccountStatus(account.getAccountStatus() != null ? account.getAccountStatus().toString() : "ACTIVE");
        accountDto.setAccountType(account.getAccountType() != null ? account.getAccountType().toString() : "SAVINGS");
        accountDto.setAccountBalance(account.getAvailableBalance());
        return accountDto;
    }
}