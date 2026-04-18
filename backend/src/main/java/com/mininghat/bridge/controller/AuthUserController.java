package com.mininghat.bridge.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.mininghat.bridge.dto.AuthLoginRequest;
import com.mininghat.bridge.model.GatewayResponse;
import com.mininghat.bridge.service.CompanyApiGateway;
import com.mininghat.bridge.support.ProxyResponseMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/proxy")
public class AuthUserController {

    private final CompanyApiGateway companyApiGateway;
    private final ProxyResponseMapper proxyResponseMapper;

    public AuthUserController(CompanyApiGateway companyApiGateway, ProxyResponseMapper proxyResponseMapper) {
        this.companyApiGateway = companyApiGateway;
        this.proxyResponseMapper = proxyResponseMapper;
    }

    @PostMapping("/login")
    public ResponseEntity<GatewayResponse> login(@Valid @RequestBody AuthLoginRequest request) {
        return proxyResponseMapper.toJsonResponse(companyApiGateway.login(request.username(), request.password()));
    }

    @GetMapping("/v1/user")
    public ResponseEntity<GatewayResponse> getCurrentUser(@RequestHeader("X-Access-Token") String token) {
        return proxyResponseMapper.toJsonResponse(companyApiGateway.get("/v1/user", token, null));
    }

    @PutMapping("/v1/users/{username}/password")
    public ResponseEntity<GatewayResponse> updatePassword(
            @RequestHeader("X-Access-Token") String token,
            @PathVariable String username,
            @RequestBody JsonNode body
    ) {
        return proxyResponseMapper.toJsonResponse(
                companyApiGateway.put("/v1/users/" + username + "/password", token, body)
        );
    }
}
