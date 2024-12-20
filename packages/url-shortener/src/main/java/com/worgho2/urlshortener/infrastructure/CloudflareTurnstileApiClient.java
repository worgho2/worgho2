package com.worgho2.urlshortener.infrastructure;

import org.reactivestreams.Publisher;

import io.micronaut.core.async.annotation.SingleResult;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Header;
import io.micronaut.http.client.annotation.Client;
import io.micronaut.serde.annotation.Serdeable;

@Client(id = "cloudflare-turnstile")
@Header(name = "Content-Type", value = "application/json")
@Header(name = "Accept", value = "application/json")
public interface CloudflareTurnstileApiClient {

    @Serdeable
    public record SiteVerifyResponse(boolean success) {

    }

    @Get("/turnstile/v0/siteverify")
    @SingleResult
    Publisher<SiteVerifyResponse> siteVerify();
}
