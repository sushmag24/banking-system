package org.banking.transfer.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.banking.transfer.model.dto.BeneficiaryDto;
import org.banking.transfer.model.dto.request.CreateBeneficiaryRequest;
import org.banking.transfer.model.dto.response.Response;
import org.banking.transfer.service.BeneficiaryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping({"/fund-transfers/beneficiaries", "/api/fund-transfers/beneficiaries"})
@Tag(name = "Beneficiary Management", description = "APIs for adding, viewing, and deleting customer transfer beneficiaries")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    @Operation(summary = "Add a new beneficiary", description = "Registers a beneficiary for a customer account with validation")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Beneficiary added successfully"),
            @ApiResponse(responseCode = "400", description = "Validation failed"),
            @ApiResponse(responseCode = "409", description = "Duplicate beneficiary or self-addition conflict")
    })
    @PostMapping
    public ResponseEntity<BeneficiaryDto> addBeneficiary(@Valid @RequestBody CreateBeneficiaryRequest request) {
        return new ResponseEntity<>(beneficiaryService.addBeneficiary(request), HttpStatus.CREATED);
    }

    @Operation(summary = "Get beneficiaries by User ID", description = "Retrieves all beneficiaries belonging to a customer")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Beneficiaries retrieved successfully")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BeneficiaryDto>> getBeneficiariesByUser(
            @Parameter(description = "Customer user ID") @PathVariable Long userId) {
        return ResponseEntity.ok(beneficiaryService.getBeneficiariesByUserId(userId));
    }

    @Operation(summary = "Get beneficiaries by source account number", description = "Retrieves all beneficiaries linked to a source account")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Beneficiaries retrieved successfully")
    })
    @GetMapping("/account/{sourceAccount}")
    public ResponseEntity<List<BeneficiaryDto>> getBeneficiariesByAccount(
            @Parameter(description = "Source account number") @PathVariable String sourceAccount) {
        return ResponseEntity.ok(beneficiaryService.getBeneficiariesBySourceAccount(sourceAccount));
    }

    @Operation(summary = "Get beneficiary by ID", description = "Retrieves a single beneficiary by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Beneficiary found"),
            @ApiResponse(responseCode = "404", description = "Beneficiary not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<BeneficiaryDto> getBeneficiaryById(
            @Parameter(description = "Beneficiary ID") @PathVariable Long id) {
        return ResponseEntity.ok(beneficiaryService.getBeneficiaryById(id));
    }

    @Operation(summary = "Delete a beneficiary", description = "Deletes a beneficiary with customer ownership validation")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Beneficiary deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Beneficiary not found or unauthorized")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Response> deleteBeneficiary(
            @Parameter(description = "Beneficiary ID") @PathVariable Long id,
            @Parameter(description = "Optional customer user ID for ownership validation") @RequestParam(required = false) Long userId) {
        beneficiaryService.deleteBeneficiary(id, userId);
        return ResponseEntity.ok(Response.builder()
                .responseCode("200")
                .message("Beneficiary deleted successfully")
                .build());
    }
}
