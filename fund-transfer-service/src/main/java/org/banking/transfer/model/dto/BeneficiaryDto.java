package org.banking.transfer.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BeneficiaryDto {
    private Long id;
    private Long userId;
    private String sourceAccountNumber;
    private String beneficiaryAccountNumber;
    private String beneficiaryName;
    private String bankName;
    private String ifscCode;
    private String accountType;
    private String email;
    private LocalDateTime createdAt;
}
