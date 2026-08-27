package org.banking.account.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountDto {
    private Long accountId;
    private String accountNumber;

    @Pattern(regexp = "^(PENDING|ACTIVE|INACTIVE|CLOSED)$", message = "Account status must be PENDING, ACTIVE, INACTIVE, or CLOSED")
    private String accountStatus;

    @NotNull(message = "Account type is required")
    private String accountType;

    @JsonProperty("accountBalance")
    @JsonAlias({"availableBalance", "accountBalance"})
    private BigDecimal accountBalance;

    @NotNull(message = "User ID is required")
    private Long userId;

    public BigDecimal getAvailableBalance() {
        return accountBalance;
    }

    public void setAvailableBalance(BigDecimal availableBalance) {
        this.accountBalance = availableBalance;
    }
}