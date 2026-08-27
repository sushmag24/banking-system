package org.banking.transfer.repository;

import org.banking.transfer.model.entity.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {

    List<Beneficiary> findByUserId(Long userId);

    List<Beneficiary> findBySourceAccountNumber(String sourceAccountNumber);

    Optional<Beneficiary> findByUserIdAndBeneficiaryAccountNumber(Long userId, String beneficiaryAccountNumber);

    Optional<Beneficiary> findByIdAndUserId(Long id, Long userId);
}
