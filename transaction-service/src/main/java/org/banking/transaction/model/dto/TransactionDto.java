package org.banking.transaction.model.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import org.banking.transaction.model.TransactionType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDto {

    @NotBlank(message = "Account ID is required")
    private String accountId;

    @NotBlank(message = "Transaction type is required")
    @Pattern(regexp = "^(DEPOSIT|WITHDRAWAL|TRANSFER_IN|TRANSFER_OUT|INTERNAL_TRANSFER|EXTERNAL_TRANSFER)$", message = "Transaction type must be DEPOSIT, WITHDRAWAL, TRANSFER_IN, TRANSFER_OUT, INTERNAL_TRANSFER, or EXTERNAL_TRANSFER")
    private String transactionType;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;
}
