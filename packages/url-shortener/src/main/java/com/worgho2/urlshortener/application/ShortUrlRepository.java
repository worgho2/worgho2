package com.worgho2.urlshortener.application;

import java.util.Optional;

import com.worgho2.urlshortener.domain.ShortUrl;

public interface ShortUrlRepository {

    public void save(ShortUrl shortUrl);

    public Optional<ShortUrl> getBySlug(String slug);
}
