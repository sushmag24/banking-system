package org.banking.transfer.service.implementation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.banking.transfer.exception.GlobalErrorCode;
import org.banking.transfer.exception.ResourceConflict;
import org.banking.transfer.exception.ResourceNotFound;
import org.banking.transfer.external.AccountService;
import org.banking.transfer.model.dto.Account;
import org.banking.transfer.model.dto.BeneficiaryDto;
import org.banking.transfer.model.dto.request.CreateBeneficiaryRequest;
import org.banking.transfer.model.entity.Beneficiary;
import org.banking.transfer.repository.BeneficiaryRepository;
import org.banking.transfer.service.BeneficiaryService;
import org.springframework.beans.BeanUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BeneficiaryServiceImpl implements BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final AccountService accountService;

    @Override
    public BeneficiaryDto addBeneficiary(CreateBeneficiaryRequest request) {
        log.info("Adding beneficiary {} for user {}", request.getBeneficiaryAccountNumber(), request.getUserId());

        if (request.getSourceAccountNumber().trim().equalsIgnoreCase(request.getBeneficiaryAccountNumber().trim())) {
            throw new ResourceConflict("Cannot add your own account number as a beneficiary");
        }

        beneficiaryRepository.findByUserIdAndBeneficiaryAccountNumber(request.getUserId(), request.getBeneficiaryAccountNumber().trim())
                .ifPresent(b -> {
                    throw new ResourceConflict("Beneficiary with account number " + request.getBeneficiaryAccountNumber() + " already exists for this user");
                });

        try {
            ResponseEntity<Account> targetAccount = accountService.readByAccountNumber(request.getBeneficiaryAccountNumber().trim());
            if (targetAccount != null && targetAccount.getBody() != null) {
                Account account = targetAccount.getBody();
                if ("CLOSED".equalsIgnoreCase(account.getAccountStatus())) {
                    throw new ResourceConflict("Cannot add a closed bank account as beneficiary");
                }
            }
        } catch (Exception ex) {
            log.debug("Target account lookup returned non-internal or exception: {}", ex.getMessage());
        }

        Beneficiary beneficiary = Beneficiary.builder()
                .userId(request.getUserId())
                .sourceAccountNumber(request.getSourceAccountNumber().trim())
                .beneficiaryAccountNumber(request.getBeneficiaryAccountNumber().trim())
                .beneficiaryName(request.getBeneficiaryName().trim())
                .bankName(request.getBankName() != null ? request.getBankName().trim() : "Apex Bank")
                .ifscCode(request.getIfscCode() != null ? request.getIfscCode().trim() : "APEX0001001")
                .accountType(request.getAccountType() != null ? request.getAccountType().trim() : "SAVINGS")
                .email(request.getEmail() != null ? request.getEmail().trim() : "")
                .build();

        Beneficiary saved = beneficiaryRepository.save(beneficiary);
        return mapToDto(saved);
    }

    @Override
    public List<BeneficiaryDto> getBeneficiariesByUserId(Long userId) {
        return beneficiaryRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<BeneficiaryDto> getBeneficiariesBySourceAccount(String sourceAccountNumber) {
        return beneficiaryRepository.findBySourceAccountNumber(sourceAccountNumber).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public BeneficiaryDto getBeneficiaryById(Long id) {
        return beneficiaryRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFound("Beneficiary not found with ID: " + id, GlobalErrorCode.NOT_FOUND));
    }

    @Override
    public void deleteBeneficiary(Long id, Long userId) {
        log.info("Deleting beneficiary ID {} for user {}", id, userId);
        if (userId != null) {
            Beneficiary beneficiary = beneficiaryRepository.findByIdAndUserId(id, userId)
                    .orElseThrow(() -> new ResourceNotFound("Beneficiary not found or you do not have permission to delete it", GlobalErrorCode.NOT_FOUND));
            beneficiaryRepository.delete(beneficiary);
        } else {
            if (!beneficiaryRepository.existsById(id)) {
                throw new ResourceNotFound("Beneficiary not found with ID: " + id, GlobalErrorCode.NOT_FOUND);
            }
            beneficiaryRepository.deleteById(id);
        }
    }

    private BeneficiaryDto mapToDto(Beneficiary entity) {
        BeneficiaryDto dto = new BeneficiaryDto();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }
}
