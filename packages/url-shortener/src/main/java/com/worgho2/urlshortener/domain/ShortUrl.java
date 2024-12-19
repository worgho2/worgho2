package com.worgho2.urlshortener.domain;

import java.util.Date;
import java.util.UUID;

import io.micronaut.core.annotation.Creator;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public class ShortUrl {
    private String id;
    private String originalUrl;
    private String slug;
    private Date createdAt;
    private Date expiresAt;

    @Creator
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

    public String getId() {
        return id;
    }

    public String getOriginalUrl() {
        return originalUrl;
    }

    public String getSlug() {
        return slug;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public Date getExpiresAt() {
        return expiresAt;
    }

}
