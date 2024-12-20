package com.worgho2.urlshortener.application.usecases;

import java.util.Optional;

import com.worgho2.urlshortener.application.CaptchaValidator;
import com.worgho2.urlshortener.application.ShortUrlRepository;
import com.worgho2.urlshortener.domain.ShortUrl;
import com.worgho2.urlshortener.domain.SlugAlreadyTakenException;
import com.worgho2.urlshortener.domain.UnauthorizedException;

import jakarta.inject.Singleton;

@Singleton
public class CreateShortUrl {

    private final CaptchaValidator captchaValidator;
    private final ShortUrlRepository shortUrlRepository;

    public CreateShortUrl(CaptchaValidator captchaValidator, ShortUrlRepository shortUrlRepository) {
        this.captchaValidator = captchaValidator;
        this.shortUrlRepository = shortUrlRepository;

    }

    public ShortUrl execute(String originalUrl, String slug, String captchaToken, String remoteIp) throws SlugAlreadyTakenException, UnauthorizedException {
        Boolean isCaptchaValid = captchaValidator.validate(captchaToken, remoteIp);

        if (!isCaptchaValid) {
            throw new UnauthorizedException("Invalid captcha");
        }

        Optional<ShortUrl> existingShortUrl = shortUrlRepository.getBySlug(slug);

        if (existingShortUrl.isPresent()) {
            throw new SlugAlreadyTakenException(slug);
        }

        ShortUrl shortUrl = ShortUrl.create(slug, originalUrl);
        shortUrlRepository.save(shortUrl);
        return shortUrl;
    }
}
