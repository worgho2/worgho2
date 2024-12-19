package com.worgho2.urlshortener.controller;

import java.util.Collections;

import com.worgho2.urlshortener.application.usecases.CreateShortUrl;
import com.worgho2.urlshortener.application.usecases.GetShortUrl;
import com.worgho2.urlshortener.domain.ShortUrl;
import com.worgho2.urlshortener.domain.ShortUrlNotFoundException;
import com.worgho2.urlshortener.domain.SlugAlreadyTakenException;
import com.worgho2.urlshortener.domain.UnauthorizedException;

import io.micronaut.core.annotation.Nullable;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Header;
import io.micronaut.http.annotation.PathVariable;
import io.micronaut.http.annotation.Post;
import io.micronaut.serde.annotation.Serdeable;

@Controller("/api/short-urls")
public class ShortUrlController {

    private final CreateShortUrl createShortUrl;
    private final GetShortUrl getShortUrl;

    public ShortUrlController(CreateShortUrl createShortUrl, GetShortUrl getShortUrl) {
        this.createShortUrl = createShortUrl;
        this.getShortUrl = getShortUrl;
    }

    @Get("/{signedUrlSlug}")
    public HttpResponse<?> getSignetUrlBySlug(@PathVariable("signedUrlSlug") String signedUrlSlug) {
        try {
            ShortUrl output = this.getShortUrl.execute(signedUrlSlug);
            return HttpResponse.created(output).contentType(MediaType.APPLICATION_JSON);
        } catch (ShortUrlNotFoundException e) {
            return HttpResponse.notFound(Collections.singletonMap("slug", signedUrlSlug));
        } catch (Exception e) {
            return HttpResponse.serverError(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @Serdeable
    public class CreateSignedUrlBody {

        public String slug;
        public String originalUrl;
        public String captchaToken;
    }

    @Post()
    public HttpResponse<?> createSignedUrl(@Body CreateSignedUrlBody body, @Nullable @Header("x-forwarded-for") String remoteIp) {
        try {
            String safeRemoteIp = remoteIp != null ? remoteIp : "127.0.0.1";
            ShortUrl output = this.createShortUrl.execute(body.originalUrl, body.slug, body.captchaToken, safeRemoteIp);
            return HttpResponse.created(output).contentType(MediaType.APPLICATION_JSON);
        } catch (SlugAlreadyTakenException e) {
            return HttpResponse.badRequest(Collections.singletonMap("error", e.getMessage()));
        } catch (UnauthorizedException e) {
            return HttpResponse.unauthorized();
        } catch (Exception e) {
            return HttpResponse.serverError(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
