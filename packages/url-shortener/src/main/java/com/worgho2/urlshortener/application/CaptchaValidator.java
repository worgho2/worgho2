package com.worgho2.urlshortener.application;

public interface CaptchaValidator {

    public boolean validate(String token, String remoteIp);
}
