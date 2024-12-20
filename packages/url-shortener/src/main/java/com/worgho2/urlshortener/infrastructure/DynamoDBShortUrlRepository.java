package com.worgho2.urlshortener.infrastructure;

import java.util.Date;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.worgho2.urlshortener.application.ShortUrlRepository;
import com.worgho2.urlshortener.domain.ShortUrl;

import io.micronaut.context.annotation.Requires;
import io.micronaut.context.annotation.Value;
import jakarta.inject.Singleton;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.GetItemResponse;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.PutItemResponse;

@Requires(beans = {DynamoDbClient.class})
@Singleton
public class DynamoDBShortUrlRepository implements ShortUrlRepository {

    private static final Logger logger = LoggerFactory.getLogger(DynamoDBShortUrlRepository.class);

    @Value("${DYNAMODB_SHORT_URL_TABLE_NAME}")
    private String tableName;

    private final DynamoDbClient client;

    public DynamoDBShortUrlRepository(DynamoDbClient client) {
        this.client = client;
    }

    private ShortUrl mapToEntity(Map<String, AttributeValue> item) {
        return ShortUrl.restore(
                item.get("slug").s(),
                item.get("originalUrl").s(),
                new Date(item.get("createdAt").s()),
                new Date(item.get("expiresAt").n())
        );
    }

    private Map<String, AttributeValue> mapToItem(ShortUrl shortUrl) {
        return Map.of(
                "slug", AttributeValue.builder().s(shortUrl.getSlug()).build(),
                "originalUrl", AttributeValue.builder().s(shortUrl.getOriginalUrl()).build(),
                "createdAt", AttributeValue.builder().s(shortUrl.getCreatedAt().toString()).build(),
                "expiresAt", AttributeValue.builder().n(String.valueOf(shortUrl.getExpiresAt().getTime() / 1000)).build()
        );
    }

    @Override
    public void save(@NotNull @Valid ShortUrl shortUrl) {
        PutItemResponse response = client.putItem(
                PutItemRequest
                        .builder()
                        .tableName(tableName)
                        .item(mapToItem(shortUrl)).build()
        );

        if (logger.isDebugEnabled()) {
            logger.debug("Saved shortUrl: {}", response.toString());
        }
    }

    @Override
    public Optional<ShortUrl> getBySlug(String slug) {
        GetItemResponse response = client.getItem(
                GetItemRequest
                        .builder()
                        .tableName(tableName)
                        .key(Map.of("slug", AttributeValue.builder().s(slug).build()))
                        .build()
        );

        return !response.hasItem() ? Optional.empty() : Optional.of(mapToEntity(response.item()));
    }
}
