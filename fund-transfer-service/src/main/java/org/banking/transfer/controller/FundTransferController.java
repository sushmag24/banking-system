package org.banking.transfer.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.banking.transfer.model.dto.FundTransferDto;
import org.banking.transfer.model.dto.request.FundTransferRequest;
import org.banking.transfer.model.dto.response.FundTransferResponse;
import org.banking.transfer.service.FundTransferService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping({"/fund-transfers", "/api/fund-transfers"})
@Tag(name = "Fund Transfer", description = "APIs for transferring funds between accounts")
public class FundTransferController {

    private final FundTransferService fundTransferService;

    @Operation(summary = "Transfer funds between accounts", description = "Transfers money from one account to another with validation")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Transfer successful"),
            @ApiResponse(responseCode = "400", description = "Insufficient balance or invalid account status"),
            @ApiResponse(responseCode = "404", description = "Source or destination account not found"),
            @ApiResponse(responseCode = "503", description = "Account service unavailable")
    })
    @PostMapping
    public ResponseEntity<FundTransferResponse> fundTransfer(@Valid @RequestBody FundTransferRequest fundTransferRequest) {
        return new ResponseEntity<>(fundTransferService.fundTransfer(fundTransferRequest), HttpStatus.CREATED);
    }

    @Operation(summary = "Get transfer details by reference ID", description = "Retrieves details of a specific fund transfer")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Transfer details retrieved"),
            @ApiResponse(responseCode = "404", description = "Transfer not found")
    })
    @GetMapping("/{referenceId}")
    public ResponseEntity<FundTransferDto> getTransferDetailsFromReferenceId(
            @Parameter(description = "Transaction reference ID") @PathVariable String referenceId) {
        return new ResponseEntity<>(fundTransferService.getTransferDetailsFromReferenceId(referenceId), HttpStatus.OK);
    }

    @Operation(summary = "Get all transfers for an account", description = "Retrieves all fund transfers initiated from an account")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Transfers retrieved"),
            @ApiResponse(responseCode = "404", description = "Account not found")
    })
    @GetMapping
    public ResponseEntity<List<FundTransferDto>> getAllTransfersByAccountId(
            @Parameter(description = "Account number") @RequestParam String accountId) {
        return new ResponseEntity<>(fundTransferService.getAllTransfersByAccountId(accountId), HttpStatus.OK);
    }
}
