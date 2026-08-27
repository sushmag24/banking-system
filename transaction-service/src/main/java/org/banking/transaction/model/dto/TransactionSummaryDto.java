package org.banking.transaction.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.banking.transaction.model.response.TransactionRequest;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TransactionSummaryDto {
    private String accountId;
    private BigDecimal totalCredited;
    private BigDecimal totalDebited;
    private long totalTransactions;
    private List<TransactionRequest> recentTransactions;
    private List<MonthlySummaryDto> monthlySummary;
}