package com.worgho2.urlshortener.infrastructure;

import java.util.Date;
import java.util.Optional;

import com.worgho2.urlshortener.application.ShortUrlRepository;
import com.worgho2.urlshortener.domain.ShortUrl;

public class DynamoDBShortUrlRepository implements ShortUrlRepository {

    @Override
    public void save(ShortUrl shortUrl) {
    }

    @Override
    public Optional<ShortUrl> getBySlug(String slug) {
        ShortUrl shortUrl = ShortUrl.restore("1", "https://github.com/worgho2", "otavio", new Date(), new Date());
        return Optional.of(shortUrl);
    }

}
