package org.banking.transaction.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MonthlySummaryDto {
    private String month;
    private int year;
    private BigDecimal totalCredit;
    private BigDecimal totalDebit;
    private long count;
}