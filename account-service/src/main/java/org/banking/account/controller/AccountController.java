package org.banking.account.controller;

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
import org.banking.account.model.dto.AccountDto;
import org.banking.account.model.dto.AccountStatusUpdate;
import org.banking.account.model.dto.response.Response;
import org.banking.account.model.dto.external.TransactionResponse;
import org.banking.account.service.AccountService;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping({"/accounts", "/api/accounts"})
@Tag(name = "Account Management", description = "APIs for bank account operations - create, update, balance inquiry, transactions")
public class AccountController {

    private final AccountService accountService;

    @Operation(summary = "Create a new bank account", description = "Creates a new bank account for a user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Account created successfully"),
            @ApiResponse(responseCode = "409", description = "Account already exists for this user and type"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PostMapping
    public ResponseEntity<Response> createAccount(@Valid @RequestBody AccountDto accountDto) {
        return new ResponseEntity<>(accountService.createAccount(accountDto), HttpStatus.CREATED);
    }

    @Operation(summary = "Update account status", description = "Updates account status (e.g., PENDING to ACTIVE)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Account status updated"),
            @ApiResponse(responseCode = "404", description = "Account not found")
    })
    @PatchMapping
    public ResponseEntity<Response> updateAccountStatus(
            @Parameter(description = "Account number") @RequestParam String accountNumber,
            @Valid @RequestBody AccountStatusUpdate accountStatusUpdate) {
        return ResponseEntity.ok(accountService.updateStatus(accountNumber, accountStatusUpdate));
    }

    @Operation(summary = "Get account by account number", description = "Retrieves account details by account number")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Account found"),
            @ApiResponse(responseCode = "404", description = "Account not found")
    })
    @GetMapping
    public ResponseEntity<AccountDto> readByAccountNumber(
            @Parameter(description = "Account number") @RequestParam String accountNumber) {
        return ResponseEntity.ok(accountService.readAccountByAccountNumber(accountNumber));
    }

    @Operation(summary = "Get all accounts", description = "Retrieves all accounts in the system (Admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Accounts retrieved")
    })
    @GetMapping("/all")
    public ResponseEntity<List<AccountDto>> readAllAccounts() {
        return ResponseEntity.ok(accountService.readAllAccounts());
    }

    @Operation(summary = "Update account details", description = "Updates account information")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Account updated"),
            @ApiResponse(responseCode = "404", description = "Account not found")
    })
    @PutMapping
    public ResponseEntity<Response> updateAccount(
            @Parameter(description = "Account number") @RequestParam String accountNumber,
            @Valid @RequestBody AccountDto accountDto) {
        return ResponseEntity.ok(accountService.updateAccount(accountNumber, accountDto));
    }

    @Operation(summary = "Get account balance", description = "Retrieves the current available balance for an account")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Balance retrieved"),
            @ApiResponse(responseCode = "404", description = "Account not found")
    })
    @GetMapping("/balance")
    public ResponseEntity<String> accountBalance(
            @Parameter(description = "Account number") @RequestParam String accountNumber) {
        return ResponseEntity.ok(accountService.getBalance(accountNumber));
    }

    @Operation(summary = "Get transactions for an account", description = "Retrieves all transactions associated with an account")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Transactions retrieved"),
            @ApiResponse(responseCode = "404", description = "Account not found")
    })
    @GetMapping("/{accountId}/transactions")
    public ResponseEntity<List<TransactionResponse>> getTransactionsFromAccountId(
            @Parameter(description = "Account number") @PathVariable String accountId) {
        return ResponseEntity.ok(accountService.getTransactionsFromAccountId(accountId));
    }

    @Operation(summary = "Close account", description = "Closes an account (balance must be zero)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Account closed"),
            @ApiResponse(responseCode = "400", description = "Balance must be zero to close"),
            @ApiResponse(responseCode = "404", description = "Account not found")
    })
    @PutMapping("/closure")
    public ResponseEntity<Response> closeAccount(
            @Parameter(description = "Account number") @RequestParam String accountNumber) {
        return ResponseEntity.ok(accountService.closeAccount(accountNumber));
    }

    @Operation(summary = "Get primary account by user ID", description = "Retrieves the account for a user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Account found"),
            @ApiResponse(responseCode = "404", description = "Account not found")
    })
    @GetMapping("/{userId}")
    public ResponseEntity<AccountDto> readAccountByUserId(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        return ResponseEntity.ok(accountService.readAccountByUserId(userId));
    }

    @Operation(summary = "Get all accounts for a user", description = "Retrieves all accounts owned by a user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Accounts retrieved")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AccountDto>> readAccountsByUserId(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        return ResponseEntity.ok(accountService.readAccountsByUserId(userId));
    }
}