package com.worgho2.urlshortener;

import org.junit.jupiter.api.AfterAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;

import io.micronaut.function.aws.proxy.MockLambdaContext;
import io.micronaut.function.aws.proxy.payload2.APIGatewayV2HTTPEventFunction;
import io.micronaut.http.HttpMethod;
import io.micronaut.http.HttpStatus;

class ShortUrlControllerTest {

    private static APIGatewayV2HTTPEventFunction handler;

    @BeforeAll
    @SuppressWarnings("unused")
    static void setupSpec() {
        handler = new APIGatewayV2HTTPEventFunction();
    }

    @AfterAll
    @SuppressWarnings("unused")
    static void cleanupSpec() {
        handler.getApplicationContext().close();
    }

    @Test
    void smokeTest() {
        APIGatewayV2HTTPEvent request = new APIGatewayV2HTTPEvent();
        request.setRequestContext(APIGatewayV2HTTPEvent.RequestContext.builder()
                .withHttp(APIGatewayV2HTTPEvent.RequestContext.Http.builder()
                        .withPath("/")
                        .withMethod(HttpMethod.GET.toString())
                        .build()
                ).build());
        var response = handler.handleRequest(request, new MockLambdaContext());

        assertEquals(HttpStatus.NOT_FOUND.getCode(), response.getStatusCode());
    }
}
