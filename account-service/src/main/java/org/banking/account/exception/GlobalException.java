package org.banking.account.exception;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class GlobalException extends RuntimeException {

    private String errorCode;
    private String errorMessage;

    public GlobalException(String errorMessage, String errorCode) {
        super(errorMessage);
        this.errorMessage = errorMessage;
        this.errorCode = errorCode;
    }

    public GlobalException(String errorMessage) {
        super(errorMessage);
        this.errorMessage = errorMessage;
    }
}
