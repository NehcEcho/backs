package com.mininghat.bridge.controller;

import com.mininghat.bridge.config.CompanyApiProperties;
import com.mininghat.bridge.model.GatewayResponse;
import com.mininghat.bridge.service.CompanyApiGateway;
import com.mininghat.bridge.support.ProxyResponseMapper;
import com.mininghat.bridge.util.RequestParamUtils;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/proxy")
public class VideoController {

    private final CompanyApiGateway companyApiGateway;
    private final ProxyResponseMapper proxyResponseMapper;
    private final CompanyApiProperties companyApiProperties;

    public VideoController(
            CompanyApiGateway companyApiGateway,
            ProxyResponseMapper proxyResponseMapper,
            CompanyApiProperties companyApiProperties
    ) {
        this.companyApiGateway = companyApiGateway;
        this.proxyResponseMapper = proxyResponseMapper;
        this.companyApiProperties = companyApiProperties;
    }

    @GetMapping("/api/v1/stream/start")
    public ResponseEntity<GatewayResponse> startStream(
            @RequestHeader("X-Access-Token") String token,
            @RequestParam MultiValueMap<String, String> queryParams
    ) {
        return proxyResponseMapper.toJsonResponse(
                companyApiGateway.get("/api/v1/stream/start", token, RequestParamUtils.clean(queryParams))
        );
    }

    @GetMapping("/api/v1/stream/stop")
    public ResponseEntity<GatewayResponse> stopStream(
            @RequestHeader("X-Access-Token") String token,
            @RequestParam MultiValueMap<String, String> queryParams
    ) {
        return proxyResponseMapper.toJsonResponse(
                companyApiGateway.get("/api/v1/stream/stop", token, RequestParamUtils.clean(queryParams))
        );
    }

    @GetMapping("/api/v1/control/ws-talk-url")
    public GatewayResponse buildTalkRelayUrl(
            @RequestHeader("X-Access-Token") String token,
            @RequestParam String serial,
            @RequestParam String code,
            @RequestParam(defaultValue = "pcm") String format
    ) {
        Map<String, Object> payload = new LinkedHashMap<>();
        String mirroredRelayPath = UriComponentsBuilder.fromPath("/api/proxy/api/v1/control/ws-talk/{serial}/{code}")
                .queryParam("format", format)
                .queryParam("token", token)
                .buildAndExpand(serial, code)
                .toUriString();
        String helperRelayPath = UriComponentsBuilder.fromPath("/ws/talk-relay")
                .queryParam("serial", serial)
                .queryParam("code", code)
                .queryParam("format", format)
                .queryParam("token", token)
                .toUriString();
        payload.put("relayPath", mirroredRelayPath);
        payload.put("helperRelayPath", helperRelayPath);
        payload.put("remoteWebsocketBaseUrl", companyApiProperties.getTalkWebsocketBaseUrl());
        payload.put("format", format);
        return new GatewayResponse(true, 200, "已生成语音喊话中继地址", payload, Instant.now());
    }

    @GetMapping("/api/v1/playback/recordlist")
    public ResponseEntity<GatewayResponse> getRecordList(
            @RequestHeader("X-Access-Token") String token,
            @RequestParam MultiValueMap<String, String> queryParams
    ) {
        return proxyResponseMapper.toJsonResponse(
                companyApiGateway.get("/api/v1/playback/recordlist", token, RequestParamUtils.clean(queryParams))
        );
    }

    @GetMapping("/api/v1/playback/start")
    public ResponseEntity<GatewayResponse> startPlayback(
            @RequestHeader("X-Access-Token") String token,
            @RequestParam MultiValueMap<String, String> queryParams
    ) {
        return proxyResponseMapper.toJsonResponse(
                companyApiGateway.get("/api/v1/playback/start", token, RequestParamUtils.clean(queryParams))
        );
    }

    @GetMapping("/api/v1/playback/stop")
    public ResponseEntity<GatewayResponse> stopPlayback(
            @RequestHeader("X-Access-Token") String token,
            @RequestParam MultiValueMap<String, String> queryParams
    ) {
        return proxyResponseMapper.toJsonResponse(
                companyApiGateway.get("/api/v1/playback/stop", token, RequestParamUtils.clean(queryParams))
        );
    }

    @GetMapping("/api/v1/playback/control")
    public ResponseEntity<GatewayResponse> controlPlayback(
            @RequestHeader("X-Access-Token") String token,
            @RequestParam MultiValueMap<String, String> queryParams
    ) {
        return proxyResponseMapper.toJsonResponse(
                companyApiGateway.get("/api/v1/playback/control", token, RequestParamUtils.clean(queryParams))
        );
    }

    @GetMapping("/api/v1/playback/streaminfo")
    public ResponseEntity<GatewayResponse> getPlaybackStreamInfo(
            @RequestHeader("X-Access-Token") String token,
            @RequestParam MultiValueMap<String, String> queryParams
    ) {
        return proxyResponseMapper.toJsonResponse(
                companyApiGateway.get("/api/v1/playback/streaminfo", token, RequestParamUtils.clean(queryParams))
        );
    }
}
