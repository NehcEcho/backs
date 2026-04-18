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
public class TalkGroupController {

    private final CompanyApiGateway companyApiGateway;
    private final PayloadValidationService payloadValidationService;
    private final ProxyResponseMapper proxyResponseMapper;

    public TalkGroupController(
            CompanyApiGateway companyApiGateway,
            PayloadValidationService payloadValidationService,
            ProxyResponseMapper proxyResponseMapper
    ) {
        this.companyApiGateway = companyApiGateway;
        this.payloadValidationService = payloadValidationService;
        this.proxyResponseMapper = proxyResponseMapper;
    }

    @PostMapping("/v1/talkgroups")
    public ResponseEntity<GatewayResponse> createTalkGroup(
            @RequestHeader("X-Access-Token") String token,
            @RequestBody JsonNode body
    ) {
        return proxyResponseMapper.toJsonResponse(companyApiGateway.post("/v1/talkgroups", token, body));
    }

    @DeleteMapping("/v1/talkgroups/{id}")
    public ResponseEntity<GatewayResponse> deleteTalkGroup(
            @RequestHeader("X-Access-Token") String token,
            @PathVariable String id
    ) {
        return proxyResponseMapper.toJsonResponse(companyApiGateway.delete("/v1/talkgroups/" + id, token, null));
    }

    @PutMapping("/v1/talkgroups/{id}")
    public ResponseEntity<GatewayResponse> updateTalkGroup(
            @RequestHeader("X-Access-Token") String token,
            @PathVariable String id,
            @RequestBody JsonNode body
    ) {
        return proxyResponseMapper.toJsonResponse(companyApiGateway.put("/v1/talkgroups/" + id, token, body));
    }

    @GetMapping("/v1/talkgroups")
    public ResponseEntity<GatewayResponse> searchTalkGroups(
            @RequestHeader("X-Access-Token") String token,
            @RequestParam MultiValueMap<String, String> queryParams
    ) {
        return proxyResponseMapper.toJsonResponse(
                companyApiGateway.get("/v1/talkgroups", token, RequestParamUtils.clean(queryParams))
        );
    }

    @PostMapping("/v1/send-talkgroup-command")
    public ResponseEntity<GatewayResponse> sendTalkGroupCommand(
            @RequestHeader("X-Access-Token") String token,
            @RequestBody JsonNode body
    ) {
        payloadValidationService.validateTalkCommand(body);
        return proxyResponseMapper.toJsonResponse(companyApiGateway.post("/v1/send-talkgroup-command", token, body));
    }
}
