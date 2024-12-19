package com.worgho2.urlshortener.domain;

public class UnauthorizedException extends Exception {

    public UnauthorizedException(String reason) {
        super(reason);
    }
}
