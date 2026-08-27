package org.banking.transfer.exception;

public class ResourceConflict extends GlobalException {
    public ResourceConflict(String message) {
        super(message, GlobalErrorCode.CONFLICT);
    }
}
