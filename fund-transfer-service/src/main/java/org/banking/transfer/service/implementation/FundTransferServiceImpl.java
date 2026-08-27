package org.banking.transfer.service.implementation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;

import org.banking.transfer.exception.AccountUpdateException;
import org.banking.transfer.exception.GlobalErrorCode;
import org.banking.transfer.exception.InsufficientBalance;
import org.banking.transfer.exception.ResourceNotFound;
import org.banking.transfer.external.AccountService;
import org.banking.transfer.external.TransactionService;
import org.banking.transfer.model.mapper.FundTransferMapper;
import org.banking.transfer.model.TransactionStatus;
import org.banking.transfer.model.TransferType;
import org.banking.transfer.model.dto.Account;
import org.banking.transfer.model.dto.FundTransferDto;
import org.banking.transfer.model.dto.Transaction;
import org.banking.transfer.model.dto.request.FundTransferRequest;
import org.banking.transfer.model.dto.response.FundTransferResponse;
import org.banking.transfer.model.entity.FundTransfer;
import org.banking.transfer.repository.FundTransferRepository;
import org.banking.transfer.service.FundTransferService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FundTransferServiceImpl implements FundTransferService {

    private final AccountService accountService;
    private final FundTransferRepository fundTransferRepository;
    private final TransactionService transactionService;

    @Value("${spring.application.ok:200}")
    private String ok;

    private final FundTransferMapper fundTransferMapper = new FundTransferMapper();

    @Override
    @CircuitBreaker(name = "accountService", fallbackMethod = "accountFallback")
    @Retry(name = "accountService")
    @RateLimiter(name = "accountService")
    public FundTransferResponse fundTransfer(FundTransferRequest fundTransferRequest) {

        if (fundTransferRequest.getFromAccount().trim().equalsIgnoreCase(fundTransferRequest.getToAccount().trim())) {
            log.error("Transfer failed: Source and destination accounts are identical");
            throw new AccountUpdateException("Source and destination accounts cannot be the same", GlobalErrorCode.BAD_REQUEST);
        }

        Account fromAccount;
        ResponseEntity<Account> response = accountService.readByAccountNumber(fundTransferRequest.getFromAccount().trim());
        if (Objects.isNull(response) || Objects.isNull(response.getBody())) {
            log.error("Requested source account {} is not found on the server", fundTransferRequest.getFromAccount());
            throw new ResourceNotFound("Source account not found on the server", GlobalErrorCode.NOT_FOUND);
        }
        fromAccount = response.getBody();
        if (!"ACTIVE".equalsIgnoreCase(fromAccount.getAccountStatus())) {
            log.error("Source account status is not ACTIVE: {}", fromAccount.getAccountStatus());
            throw new AccountUpdateException("Source account is not active. Status: " + fromAccount.getAccountStatus(), GlobalErrorCode.NOT_ACCEPTABLE);
        }
        if (fromAccount.getAvailableBalance().compareTo(fundTransferRequest.getAmount()) < 0) {
            log.error("Insufficient balance. Required: {}, Available: {}", fundTransferRequest.getAmount(), fromAccount.getAvailableBalance());
            throw new InsufficientBalance("Insufficient balance in source account", GlobalErrorCode.NOT_ACCEPTABLE);
        }

        Account toAccount;
        response = accountService.readByAccountNumber(fundTransferRequest.getToAccount().trim());
        if (Objects.isNull(response) || Objects.isNull(response.getBody())) {
            log.error("Requested destination account {} is not found on the server", fundTransferRequest.getToAccount());
            throw new ResourceNotFound("Destination account not found on the server", GlobalErrorCode.NOT_FOUND);
        }
        toAccount = response.getBody();
        if (!"ACTIVE".equalsIgnoreCase(toAccount.getAccountStatus())) {
            log.error("Destination account status is not ACTIVE: {}", toAccount.getAccountStatus());
            throw new AccountUpdateException("Destination account is not active. Status: " + toAccount.getAccountStatus(), GlobalErrorCode.NOT_ACCEPTABLE);
        }

        String transactionId = internalTransfer(fromAccount, toAccount, fundTransferRequest.getAmount());
        FundTransfer fundTransfer = FundTransfer.builder()
                .transferType(TransferType.INTERNAL)
                .amount(fundTransferRequest.getAmount())
                .fromAccount(fromAccount.getAccountNumber())
                .transactionReference(transactionId)
                .status(TransactionStatus.SUCCESS)
                .toAccount(toAccount.getAccountNumber()).build();

        fundTransferRepository.save(fundTransfer);
        return FundTransferResponse.builder()
                .transactionId(transactionId)
                .message("Fund transfer of " + fundTransferRequest.getAmount() + " was successful").build();
    }

    @CircuitBreaker(name = "transactionService", fallbackMethod = "transactionFallback")
    @Retry(name = "transactionService")
    @RateLimiter(name = "transactionService")
    private String internalTransfer(Account fromAccount, Account toAccount, BigDecimal amount) {

        fromAccount.setAvailableBalance(fromAccount.getAvailableBalance().subtract(amount));
        accountService.updateAccount(fromAccount.getAccountNumber(), fromAccount);

        toAccount.setAvailableBalance(toAccount.getAvailableBalance().add(amount));
        accountService.updateAccount(toAccount.getAccountNumber(), toAccount);

        List<Transaction> transactions = List.of(
                Transaction.builder()
                        .accountId(fromAccount.getAccountNumber())
                        .transactionType("INTERNAL_TRANSFER")
                        .amount(amount.negate())
                        .description("Transfer to " + toAccount.getAccountNumber())
                        .build(),
                Transaction.builder()
                        .accountId(toAccount.getAccountNumber())
                        .transactionType("INTERNAL_TRANSFER")
                        .amount(amount)
                        .description("Transfer received from " + fromAccount.getAccountNumber()).build());

        String transactionReference = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        transactionService.makeInternalTransactions(transactions, transactionReference);
        return transactionReference;
    }

    @Override
    public FundTransferDto getTransferDetailsFromReferenceId(String referenceId) {

        return fundTransferRepository.findFundTransferByTransactionReference(referenceId)
                .map(fundTransferMapper::convertToDto)
                .orElseThrow(() -> new ResourceNotFound("Fund transfer not found with reference: " + referenceId, GlobalErrorCode.NOT_FOUND));
    }

    @Override
    public List<FundTransferDto> getAllTransfersByAccountId(String accountId) {

        return fundTransferMapper.convertToDtoList(fundTransferRepository.findFundTransferByFromAccount(accountId));
    }

    public FundTransferResponse accountFallback(FundTransferRequest request, Throwable ex) {
        log.error("Fallback triggered for fundTransfer. Reason = {}", ex.toString());

        return FundTransferResponse.builder()
                .transactionId(null)
                .message("Account service unavailable right now. Please retry later.")
                .build();
    }

    public String transactionFallback(Account fromAccount, Account toAccount, BigDecimal amount, Throwable ex) {
        log.error("Fallback triggered for TRANSACTION service call. Reason = {}", ex.toString());
        throw new RuntimeException("Transaction service unavailable. Transfer rolled back.");
    }
}
