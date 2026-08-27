package org.banking.transaction.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.banking.transaction.model.dto.TransactionDto;
import org.banking.transaction.model.dto.TransactionSummaryDto;
import org.banking.transaction.model.response.Response;
import org.banking.transaction.model.response.TransactionRequest;
import org.banking.transaction.service.TransactionService;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping({"/transactions", "/api/transactions"})
@Tag(name = "Transaction Management", description = "APIs for transaction logging, retrieval, filtering and dashboard summary")
public class TransactionController {

    private final TransactionService transactionService;

    @Operation(summary = "Add a new transaction", description = "Logs a deposit or withdrawal transaction")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Transaction logged successfully"),
            @ApiResponse(responseCode = "400", description = "Insufficient balance or invalid account status"),
            @ApiResponse(responseCode = "404", description = "Account not found")
    })
    @PostMapping
    public ResponseEntity<Response> addTransactions(@Valid @RequestBody TransactionDto transactionDto) {
        return new ResponseEntity<>(transactionService.addTransaction(transactionDto), HttpStatus.CREATED);
    }

    @Operation(summary = "Add internal transfer transactions", description = "Logs both debit and credit transactions for a fund transfer")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Transactions logged successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid transaction data")
    })
    @PostMapping("/internal")
    public ResponseEntity<Response> makeInternalTransaction(
            @Valid @RequestBody List<TransactionDto> transactionDtos,
            @Parameter(description = "Transaction reference ID") @RequestParam String transactionReference) {
        return new ResponseEntity<>(transactionService.internalTransaction(transactionDtos, transactionReference), HttpStatus.CREATED);
    }

    @Operation(summary = "Get transactions for an account with optional filters", description = "Retrieves all transactions or filtered transactions by date, type, and status")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Transactions retrieved"),
            @ApiResponse(responseCode = "404", description = "Account not found")
    })
    @GetMapping
    public ResponseEntity<List<TransactionRequest>> getTransactions(
            @Parameter(description = "Account number") @RequestParam String accountId,
            @Parameter(description = "Optional start date filter (yyyy-MM-dd)") @RequestParam(required = false) String startDate,
            @Parameter(description = "Optional end date filter (yyyy-MM-dd)") @RequestParam(required = false) String endDate,
            @Parameter(description = "Optional transaction type filter (DEPOSIT, WITHDRAWAL, INTERNAL_TRANSFER)") @RequestParam(required = false) String type,
            @Parameter(description = "Optional transaction status filter (COMPLETED, PENDING, FAILED)") @RequestParam(required = false) String status) {

        if (startDate != null || endDate != null || type != null || status != null) {
            return ResponseEntity.ok(transactionService.filterTransactions(accountId, startDate, endDate, type, status));
        }
        return ResponseEntity.ok(transactionService.getTransaction(accountId));
    }

    @Operation(summary = "Get transaction dashboard summary", description = "Retrieves total credited, debited, recent transactions, and monthly statistics for an account")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Summary retrieved"),
            @ApiResponse(responseCode = "404", description = "Account not found")
    })
    @GetMapping("/{accountId}/summary")
    public ResponseEntity<TransactionSummaryDto> getAccountSummary(
            @Parameter(description = "Account number") @PathVariable String accountId) {
        return ResponseEntity.ok(transactionService.getAccountSummary(accountId));
    }

    @Operation(summary = "Get transactions by reference ID", description = "Retrieves all transactions associated with a transfer reference")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Transactions retrieved"),
            @ApiResponse(responseCode = "404", description = "No transactions found for reference")
    })
    @GetMapping("/reference/{referenceId}")
    public ResponseEntity<List<TransactionRequest>> getTransactionByTransactionReference(
            @Parameter(description = "Transaction reference ID") @PathVariable String referenceId) {
        return ResponseEntity.ok(transactionService.getTransactionByTransactionReference(referenceId));
    }
}