package com.legion.common.exception;

import java.io.Serial;

// Base Exception
public class LegionException extends RuntimeException {
    @Serial
    private static final long serialVersionUID = -8360671446842678834L;

    public LegionException(String message) {
        super(message);
    }

    public LegionException(String message, Throwable cause) {
        super(message, cause);
    }
}
