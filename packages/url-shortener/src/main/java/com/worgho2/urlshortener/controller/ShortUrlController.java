package com.worgho2.urlshortener.controller;

import java.util.Collections;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.worgho2.urlshortener.application.usecases.CreateShortUrl;
import com.worgho2.urlshortener.application.usecases.GetShortUrl;
import com.worgho2.urlshortener.domain.ShortUrl;
import com.worgho2.urlshortener.domain.ShortUrlNotFoundException;
import com.worgho2.urlshortener.domain.SlugAlreadyTakenException;
import com.worgho2.urlshortener.domain.UnauthorizedException;

import io.micronaut.core.annotation.NonNull;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Header;
import io.micronaut.http.annotation.PathVariable;
import io.micronaut.http.annotation.Post;
import io.micronaut.validation.Validated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Controller("/api/short-urls")
@Validated
public class ShortUrlController {
    private static final Logger logger = LoggerFactory.getLogger(ShortUrlController.class);

    private final CreateShortUrl createShortUrl;
    private final GetShortUrl getShortUrl;

    public ShortUrlController(CreateShortUrl createShortUrl, GetShortUrl getShortUrl) {
        this.createShortUrl = createShortUrl;
        this.getShortUrl = getShortUrl;
    }

    @Get("/{signedUrlSlug}")
    public HttpResponse<?> getSignetUrlBySlug(@PathVariable("signedUrlSlug") @NonNull @NotBlank String signedUrlSlug) {
        try {
            ShortUrl shortUrl = this.getShortUrl.execute(signedUrlSlug);
            return HttpResponse.ok(shortUrl).contentType(MediaType.APPLICATION_JSON);
        } catch (ShortUrlNotFoundException e) {
            return HttpResponse.notFound(Collections.singletonMap("slug", signedUrlSlug));
        } catch (Exception e) {
            logger.error("Error getting short url", e);
            return HttpResponse.serverError(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @Post()
    public HttpResponse<?> createSignedUrl(
            @NotBlank(message = "Slug is required")
            @Pattern(regexp = "^[a-zA-Z0-9-_]+$", message = "Slug must contain only letters, numbers, hyphens and underscores")
            @Size(min = 1, max = 32, message = "Slug must be between 1 and 32 characters")
            @Body("slug") String slug,
            @NotBlank(message = "Original url is required")
            @Pattern(regexp = "^https?://.*$")
            @Body("originalUrl") String originalUrl,
            @NotNull
            @NotBlank(message = "Captcha token is required")
            @Body("captchaToken") String captchaToken,
            @Nullable
            @Header("x-forwarded-for") String forwaredFor
    ) {
        try {
            String remoteIp = forwaredFor != null ? forwaredFor : "127.0.0.1";
            ShortUrl output = this.createShortUrl.execute(originalUrl, slug, captchaToken, remoteIp);
            return HttpResponse.created(output).contentType(MediaType.APPLICATION_JSON);
        } catch (SlugAlreadyTakenException e) {
            return HttpResponse.badRequest(Collections.singletonMap("error", e.getMessage()));
        } catch (UnauthorizedException e) {
            return HttpResponse.unauthorized();
        } catch (Exception e) {
            logger.error("Error creating short url", e);
            return HttpResponse.serverError(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
