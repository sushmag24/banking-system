package org.banking.account.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.banking.account.model.AccountStatus;

@Data
public class AccountStatusUpdate {
    @NotNull(message = "Account status is required")
    AccountStatus accountStatus;
    
}
