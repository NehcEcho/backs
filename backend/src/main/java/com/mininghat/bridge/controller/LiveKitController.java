package com.mininghat.bridge.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.mininghat.bridge.config.CompanyApiProperties;
import com.mininghat.bridge.model.GatewayResponse;
import com.mininghat.bridge.service.CompanyApiGateway;
import com.mininghat.bridge.service.PayloadValidationService;
import com.mininghat.bridge.support.ProxyResponseMapper;
import java.time.Instant;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/proxy")
public class LiveKitController {

    private final CompanyApiGateway companyApiGateway;
    private final PayloadValidationService payloadValidationService;
    private final ProxyResponseMapper proxyResponseMapper;
    private final CompanyApiProperties companyApiProperties;

    public LiveKitController(
            CompanyApiGateway companyApiGateway,
            PayloadValidationService payloadValidationService,
            ProxyResponseMapper proxyResponseMapper,
            CompanyApiProperties companyApiProperties
    ) {
        this.companyApiGateway = companyApiGateway;
        this.payloadValidationService = payloadValidationService;
        this.proxyResponseMapper = proxyResponseMapper;
        this.companyApiProperties = companyApiProperties;
    }

    @PostMapping("/webrtc/token")
    public ResponseEntity<GatewayResponse> generateLivekitToken(
            @RequestHeader("X-Access-Token") String token,
            @RequestBody JsonNode body
    ) {
        payloadValidationService.validateLivekitRequest(body);
        return proxyResponseMapper.toJsonResponse(companyApiGateway.post("/webrtc/token", token, body));
    }

    @GetMapping("/webrtc/server-info")
    public GatewayResponse getLivekitServerInfo() {
        return new GatewayResponse(
                true,
                200,
                "LiveKit 服务地址",
                Map.of("serverUrl", companyApiProperties.getLivekitServerUrl()),
                Instant.now()
        );
    }
}
