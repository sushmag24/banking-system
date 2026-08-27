package org.banking.transfer.service;

import org.banking.transfer.model.dto.BeneficiaryDto;
import org.banking.transfer.model.dto.request.CreateBeneficiaryRequest;

import java.util.List;

public interface BeneficiaryService {

    BeneficiaryDto addBeneficiary(CreateBeneficiaryRequest request);

    List<BeneficiaryDto> getBeneficiariesByUserId(Long userId);

    List<BeneficiaryDto> getBeneficiariesBySourceAccount(String sourceAccountNumber);

    BeneficiaryDto getBeneficiaryById(Long id);

    void deleteBeneficiary(Long id, Long userId);
}
