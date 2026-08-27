package org.banking.user.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.banking.user.model.Status;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    private String tokenType;
    private Long userId;
    private String emailId;
    private String firstName;
    private String lastName;
    private String role;
    private Status status;
    private String authId;
    private String identificationNumber;
}