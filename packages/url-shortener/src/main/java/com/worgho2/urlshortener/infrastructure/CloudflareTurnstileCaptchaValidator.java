package com.worgho2.urlshortener.infrastructure;

import com.worgho2.urlshortener.application.CaptchaValidator;

import jakarta.inject.Singleton;

@Singleton
public class CloudflareTurnstileCaptchaValidator implements CaptchaValidator {

    // private final String secretKey;
    // public CloudflareTurnstileCaptchaValidator(String secretKey) {
    //     this.secretKey = secretKey;
    // }
    @Override
    public boolean validate(String token, String remoteIp) {
        return true;
    }

}
