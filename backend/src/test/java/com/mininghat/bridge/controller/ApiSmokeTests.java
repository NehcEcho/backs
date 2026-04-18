package com.mininghat.bridge.controller;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ApiSmokeTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnHealthStatus() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.remoteStatus").value(200))
                .andExpect(jsonPath("$.payload.status").value("UP"));
    }

    @Test
    void shouldReturnLivekitServerInfo() throws Exception {
        mockMvc.perform(get("/api/proxy/webrtc/server-info"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.remoteStatus").value(200))
                .andExpect(jsonPath("$.payload.serverUrl").value("wss://webrtc.znhaas.net"));
    }

    @Test
    void shouldRejectBlankLoginPayload() throws Exception {
        mockMvc.perform(post("/api/proxy/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "",
                                  "password": ""
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.remoteStatus").value(400))
                .andExpect(jsonPath("$.message").isString());
    }

    @Test
    void shouldRejectInvalidLivekitRequest() throws Exception {
        mockMvc.perform(post("/api/proxy/webrtc/token")
                        .header("X-Access-Token", "test-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "isMeeting": false,
                                  "devices": ["device-a", "device-b"]
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("非会议模式下 devices 不能超过 1 个"));
    }

    @Test
    void shouldGenerateTalkRelayPaths() throws Exception {
        mockMvc.perform(get("/api/proxy/api/v1/control/ws-talk-url")
                        .header("X-Access-Token", "test-token")
                        .queryParam("serial", "31011500991323310018")
                        .queryParam("code", "31011500991323310018")
                        .queryParam("format", "pcm"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.payload.relayPath", containsString("/api/proxy/api/v1/control/ws-talk/31011500991323310018/31011500991323310018")))
                .andExpect(jsonPath("$.payload.helperRelayPath", containsString("/ws/talk-relay")))
                .andExpect(jsonPath("$.payload.remoteWebsocketBaseUrl").value("wss://api.znhaas.net:2443"));
    }
}
