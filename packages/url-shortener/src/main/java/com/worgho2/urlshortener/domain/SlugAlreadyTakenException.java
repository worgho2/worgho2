package com.worgho2.urlshortener.domain;

public class SlugAlreadyTakenException extends Exception {

    public SlugAlreadyTakenException(String slug) {
        super("Slug " + slug + " already taken");
    }
}
