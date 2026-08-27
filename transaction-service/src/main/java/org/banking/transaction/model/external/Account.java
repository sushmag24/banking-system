package org.banking.transaction.model.external;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Account {

    private Long accountId;

    private String accountNumber;

    private String accountType;

    private String accountStatus;

    @JsonProperty("availableBalance")
    @JsonAlias({"accountBalance", "availableBalance"})
    private BigDecimal availableBalance;

    private Long userId;

    public BigDecimal getAccountBalance() {
        return availableBalance;
    }

    public void setAccountBalance(BigDecimal accountBalance) {
        this.availableBalance = accountBalance;
    }
}
