package com.mininghat.bridge.config;

import java.net.http.HttpClient;
import java.time.Duration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CompanyHttpClientConfig {

    @Bean
    public HttpClient companyHttpClient(CompanyApiProperties properties) {
        return HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(properties.getConnectTimeoutSeconds()))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }
}
