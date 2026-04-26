package com.mininghat.bridge.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.mininghat.bridge.model.GatewayResponse;
import com.mininghat.bridge.service.CompanyApiGateway;
import com.mininghat.bridge.service.PayloadValidationService;
import com.mininghat.bridge.support.ProxyResponseMapper;
import com.mininghat.bridge.util.RequestParamUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/proxy")
public class FenceAlarmController {

    private final CompanyApiGateway companyApiGateway;
    private final PayloadValidationService payloadValidationService;
    private final ProxyResponseMapper proxyResponseMapper;

    public FenceAlarmController(
            CompanyApiGateway companyApiGateway,
            PayloadValidationService payloadValidationService,
            ProxyResponseMapper proxyResponseMapper
    ) {
        this.companyApiGateway = companyApiGateway;
        this.payloadValidationService = payloadValidationService;
        this.proxyResponseMapper = proxyResponseMapper;
    }

    @PostMapping("/v1/fences")
    public ResponseEntity<GatewayResponse> createFence(
            @RequestHeader("X-Access-Token") String token,
            @RequestBody JsonNode body
    ) {
        payloadValidationService.validateFencePayload(body, true);
        return proxyResponseMapper.toJsonResponse(companyApiGateway.post("/v1/fences", token, body));
    }

    @PutMapping("/v1/fences/{id}")
    public ResponseEntity<GatewayResponse> updateFence(
            @RequestHeader("X-Access-Token") String token,
            @PathVariable String id,
            @RequestBody JsonNode body
    ) {
        payloadValidationService.validateFencePayload(body, false);
        return proxyResponseMapper.toJsonResponse(companyApiGateway.put("/v1/fences/" + id, token, body));
    }

    @DeleteMapping("/v1/fences/{id}")
    public ResponseEntity<GatewayResponse> deleteFence(
            @RequestHeader("X-Access-Token") String token,
            @PathVariable String id
    ) {
        return proxyResponseMapper.toJsonResponse(companyApiGateway.delete("/v1/fences/" + id, token, null));
    }

    @GetMapping("/v1/fences/{id}")
    public ResponseEntity<GatewayResponse> getFenceById(
            @RequestHeader("X-Access-Token") String token,
            @PathVariable String id
    ) {
        return proxyResponseMapper.toJsonResponse(companyApiGateway.get("/v1/fences/" + id, token, null));
    }

    @GetMapping("/v1/fences")
    public ResponseEntity<GatewayResponse> getFenceList(
            @RequestHeader("X-Access-Token") String token,
            @RequestParam MultiValueMap<String, String> queryParams
    ) {
        return proxyResponseMapper.toJsonResponse(
                companyApiGateway.get("/v1/fences", token, RequestParamUtils.clean(queryParams))
        );
    }

    @GetMapping("/v1/alarms")
    public ResponseEntity<GatewayResponse> getAlarmList(
            @RequestHeader("X-Access-Token") String token,
            @RequestParam MultiValueMap<String, String> queryParams
    ) {
        return proxyResponseMapper.toJsonResponse(
                companyApiGateway.get("/v1/alarms", token, RequestParamUtils.clean(queryParams))
        );
    }

    @PutMapping("/v1/alarms/{id}")
    public ResponseEntity<GatewayResponse> updateAlarm(
            @RequestHeader("X-Access-Token") String token,
            @PathVariable String id,
            @RequestBody JsonNode body
    ) {
        payloadValidationService.validateAlarmUpdate(body);
        return proxyResponseMapper.toJsonResponse(companyApiGateway.put("/v1/alarms/" + id, token, body));
    }
}
