package com.legion.common.exception;

import java.io.Serial;

public class UnauthorizedException extends LegionException {

    @Serial
    private static final long serialVersionUID = 8689780194281359083L;

    public UnauthorizedException(String message) {
        super(message);
    }
}