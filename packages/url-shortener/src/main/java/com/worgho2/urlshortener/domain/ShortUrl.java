package com.worgho2.urlshortener.domain;

import java.util.Date;

import io.micronaut.core.annotation.Creator;
import io.micronaut.core.annotation.NonNull;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotBlank;

@Serdeable
public class ShortUrl {

    @NonNull
    @NotBlank
    private final String slug;

    @NonNull
    @NotBlank
    private final String originalUrl;

    @NonNull
    private final Date createdAt;

    @NonNull
    private final Date expiresAt;

    @Creator
    private ShortUrl(@NonNull String slug, @NonNull String originalUrl, @NonNull Date createdAt, @NonNull Date expiresAt) {
        this.slug = slug;
        this.originalUrl = originalUrl;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }

    public static ShortUrl create(String slug, String originalUrl) {
        Date createdAt = new Date();
        Date expiresAt = new Date(createdAt.getTime() + 10 * 60 * 1000);

        return new ShortUrl(slug, originalUrl, createdAt, expiresAt);
    }

    public static ShortUrl restore(String slug, String originalUrl,  Date createdAt, Date expiresAt) {
        return new ShortUrl(slug, originalUrl,  createdAt, expiresAt);
    }

    @NonNull
    public String getSlug() {
        return slug;
    }

    @NonNull
    public String getOriginalUrl() {
        return originalUrl;
    }

    @NonNull
    public Date getCreatedAt() {
        return createdAt;
    }

    @NonNull
    public Date getExpiresAt() {
        return expiresAt;
    }
}
