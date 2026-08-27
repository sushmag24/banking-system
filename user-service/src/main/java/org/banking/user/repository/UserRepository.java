package org.banking.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.banking.user.model.entity.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findUserByAuthId(String authId);
    Optional<User> findFirstByEmailIdOrderByUserIdDesc(String emailId);
    default Optional<User> findUserByEmailId(String emailId) {
        return findFirstByEmailIdOrderByUserIdDesc(emailId);
    }
}