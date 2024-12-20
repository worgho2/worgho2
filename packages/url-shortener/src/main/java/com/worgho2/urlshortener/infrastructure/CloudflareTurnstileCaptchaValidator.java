package com.worgho2.urlshortener.infrastructure;

import java.net.URI;
import java.util.Map;

import com.worgho2.urlshortener.application.CaptchaValidator;

import io.micronaut.context.annotation.Value;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.client.HttpClient;
import io.micronaut.http.client.annotation.Client;
import io.micronaut.http.uri.UriBuilder;
import jakarta.inject.Singleton;

@Singleton
public class CloudflareTurnstileCaptchaValidator implements CaptchaValidator {

    @Value("${CLOUDFLARE_TURNSTILE_SECRET_KEY}")
    private String secretKey;

    private final HttpClient httpClient;
    private final URI uri;

    public CloudflareTurnstileCaptchaValidator(
            @Client(id = "cloudflare-turnstile") HttpClient httpClient
    ) {
        this.httpClient = httpClient;
        this.uri = UriBuilder
                .of("/turnstile")
                .path("v0")
                .path("siteverify")
                .build();
    }

    @Override
    public boolean validate(String token, String remoteIp) {
        HttpRequest request = HttpRequest.POST(
                uri,
                Map.of(
                        "secret", this.secretKey,
                        "response", token,
                        "remoteip", remoteIp
                )
        );

        /**
         * Blocking call is fine here, since the service runs on a AWS Lambda
         * Runtime.
         */
        return this.httpClient
                .toBlocking()
                .retrieve(request, CloudflareTurnstileApiClient.SiteVerifyResponse.class)
                .success();
    }

}
