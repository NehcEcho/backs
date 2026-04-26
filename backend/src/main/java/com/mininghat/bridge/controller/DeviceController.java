package com.mininghat.bridge.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.mininghat.bridge.model.GatewayResponse;
import com.mininghat.bridge.service.CompanyApiGateway;
import com.mininghat.bridge.service.PayloadValidationService;
import com.mininghat.bridge.support.ProxyResponseMapper;
import com.mininghat.bridge.util.RequestParamUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
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
public class DeviceController {

    private final CompanyApiGateway companyApiGateway;
    private final PayloadValidationService payloadValidationService;
    private final ProxyResponseMapper proxyResponseMapper;

    public DeviceController(
            CompanyApiGateway companyApiGateway,
            PayloadValidationService payloadValidationService,
            ProxyResponseMapper proxyResponseMapper
    ) {
        this.companyApiGateway = companyApiGateway;
        this.payloadValidationService = payloadValidationService;
        this.proxyResponseMapper = proxyResponseMapper;
    }

    @GetMapping("/v1/user/devices")
    public ResponseEntity<GatewayResponse> getCurrentUserDevices(@RequestHeader("X-Access-Token") String token) {
        return proxyResponseMapper.toJsonResponse(companyApiGateway.get("/v1/user/devices", token, null));
    }

    @GetMapping("/v1/devices/{id}")
    public ResponseEntity<GatewayResponse> getDeviceById(
            @RequestHeader("X-Access-Token") String token,
            @PathVariable String id
    ) {
        return proxyResponseMapper.toJsonResponse(companyApiGateway.get("/v1/devices/" + id, token, null));
    }

    @GetMapping("/v1/devices")
    public ResponseEntity<GatewayResponse> getDeviceList(
            @RequestHeader("X-Access-Token") String token,
            @RequestParam MultiValueMap<String, String> queryParams
    ) {
        return proxyResponseMapper.toJsonResponse(
                companyApiGateway.get("/v1/devices", token, RequestParamUtils.clean(queryParams))
        );
    }

    @PutMapping("/v1/devices/{id}")
    public ResponseEntity<GatewayResponse> updateDevice(
            @RequestHeader("X-Access-Token") String token,
            @PathVariable String id,
            @RequestBody JsonNode body
    ) {
        payloadValidationService.validateDeviceUpdate(body);
        return proxyResponseMapper.toJsonResponse(companyApiGateway.put("/v1/devices/" + id, token, body));
    }

    @GetMapping("/v1/device/file")
    public ResponseEntity<GatewayResponse> getDeviceFiles(
            @RequestHeader("X-Access-Token") String token,
            @RequestParam MultiValueMap<String, String> queryParams
    ) {
        return proxyResponseMapper.toJsonResponse(
                companyApiGateway.get("/v1/device/file", token, RequestParamUtils.clean(queryParams))
        );
    }

    @PostMapping("/v1/device/file/delete")
    public ResponseEntity<GatewayResponse> deleteDeviceFile(
            @RequestHeader("X-Access-Token") String token,
            @RequestBody JsonNode body
    ) {
        payloadValidationService.validateDeviceFileDelete(body);
        return proxyResponseMapper.toJsonResponse(companyApiGateway.post("/v1/device/file/delete", token, body));
    }

    @GetMapping("/v1/locations")
    public ResponseEntity<GatewayResponse> getLocations(
            @RequestHeader("X-Access-Token") String token,
            @RequestParam MultiValueMap<String, String> queryParams
    ) {
        return proxyResponseMapper.toJsonResponse(
                companyApiGateway.get("/v1/locations", token, RequestParamUtils.clean(queryParams))
        );
    }
}
