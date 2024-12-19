package com.worgho2.urlshortener.domain;

public class ShortUrlNotFoundException extends Exception {

    public ShortUrlNotFoundException(String slug) {
        super("Slug " + slug + " not found");
    }
}
