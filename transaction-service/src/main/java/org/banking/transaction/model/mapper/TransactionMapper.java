package org.banking.transaction.model.mapper;

import java.util.Objects;

import org.banking.transaction.model.TransactionType;
import org.banking.transaction.model.dto.TransactionDto;
import org.banking.transaction.model.entity.Transaction;
import org.springframework.beans.BeanUtils;

public class TransactionMapper extends BaseMapper<Transaction, TransactionDto> {

    @Override
    public Transaction convertToEntity(TransactionDto dto, Object... args) {

        Transaction transaction = new Transaction();
        if (!Objects.isNull(dto)) {
            BeanUtils.copyProperties(dto, transaction);
            if (dto.getDescription() != null) {
                transaction.setComments(dto.getDescription());
            }
            if (dto.getTransactionType() != null) {
                try {
                    transaction.setTransactionType(TransactionType.valueOf(dto.getTransactionType().toUpperCase()));
                } catch (Exception ignored) {}
            }
        }
        return transaction;
    }

    @Override
    public TransactionDto convertToDto(Transaction entity, Object... args) {

        TransactionDto transactionDto = new TransactionDto();
        if (!Objects.isNull(entity)) {
            BeanUtils.copyProperties(entity, transactionDto);
        }
        return transactionDto;
    }
}
