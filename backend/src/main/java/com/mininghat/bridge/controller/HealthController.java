package com.mininghat.bridge.controller;

import com.mininghat.bridge.model.GatewayResponse;
import java.time.Instant;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public GatewayResponse health() {
        return new GatewayResponse(true, 200, "服务正常", Map.of("status", "UP"), Instant.now());
    }
}
