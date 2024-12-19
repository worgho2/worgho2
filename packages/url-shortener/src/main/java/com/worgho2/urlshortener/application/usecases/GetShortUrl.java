package com.worgho2.urlshortener.application.usecases;

import java.util.Optional;

import com.worgho2.urlshortener.application.ShortUrlRepository;
import com.worgho2.urlshortener.domain.ShortUrl;
import com.worgho2.urlshortener.domain.ShortUrlNotFoundException;

import jakarta.inject.Singleton;

@Singleton
public class GetShortUrl {

    private final ShortUrlRepository shortUrlRepository;

    public GetShortUrl(ShortUrlRepository shortUrlRepository) {
        this.shortUrlRepository = shortUrlRepository;
    }

    public ShortUrl execute(String slug) throws ShortUrlNotFoundException {
        Optional<ShortUrl> shortUrl = shortUrlRepository.getBySlug(slug);

        if (shortUrl.isEmpty()) {
            throw new ShortUrlNotFoundException(slug);
        }

        return shortUrl.get();
    }
}
