package org.banking.user.model.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {

    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;

    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;

    @Pattern(regexp = "^(MALE|FEMALE|OTHER)$", message = "Gender must be MALE, FEMALE, or OTHER")
    private String gender;

    @Size(max = 200, message = "Address must not exceed 200 characters")
    private String address;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Contact number must be a valid 10-digit Indian mobile number")
    private String contactNo;

    @Size(max = 100, message = "Occupation must not exceed 100 characters")
    private String occupation;

    @Pattern(regexp = "^(SINGLE|MARRIED|DIVORCED|WIDOWED)$", message = "Marital status must be SINGLE, MARRIED, DIVORCED, or WIDOWED")
    private String martialStatus;

    @Size(max = 50, message = "Nationality must not exceed 50 characters")
    private String nationality;
}
