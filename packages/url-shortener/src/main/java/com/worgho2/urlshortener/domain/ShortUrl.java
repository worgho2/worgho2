package com.worgho2.urlshortener.domain;

import java.util.Date;
import java.util.UUID;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public class ShortUrl {

    public final String id;
    public final String originalUrl;
    public final String slug;
    public final Date createdAt;
    public final Date expiresAt;

    private ShortUrl(String id, String originalUrl, String slug, Date createdAt, Date expiresAt) {
        this.id = id;
        this.originalUrl = originalUrl;
        this.slug = slug;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }

    public static ShortUrl create(String originalUrl, String slug) {
        String id = UUID.randomUUID().toString();
        Date createdAt = new Date();
        Date expiresAt = new Date(createdAt.getTime() + 10 * 60 * 1000);

        return new ShortUrl(id, originalUrl, slug, createdAt, expiresAt);
    }

    public static ShortUrl restore(String id, String originalUrl, String slug, Date createdAt, Date expiresAt) {
        return new ShortUrl(id, originalUrl, slug, createdAt, expiresAt);
    }

}
