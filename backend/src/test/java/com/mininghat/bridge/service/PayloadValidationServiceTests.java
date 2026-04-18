package com.mininghat.bridge.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class PayloadValidationServiceTests {

    private final PayloadValidationService payloadValidationService = new PayloadValidationService();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void shouldRejectCircleFenceWithoutCircleData() throws Exception {
        String json = """
                {
                  "fenceName": "测试围栏",
                  "startTimeStr": "00:00",
                  "endTimeStr": "00:00",
                  "eventType": 11,
                  "deviceIndexIds": [1],
                  "fenceShape": "Circle"
                }
                """;

        Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> payloadValidationService.validateFencePayload(objectMapper.readTree(json), true)
        );
    }

    @Test
    void shouldRejectTalkCommandWithoutClientIdWhenRequired() throws Exception {
        String json = """
                {
                  "groupId": 1,
                  "command": "8010"
                }
                """;

        Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> payloadValidationService.validateTalkCommand(objectMapper.readTree(json))
        );
    }

    @Test
    void shouldRejectLivekitSingleModeWithMultipleDevices() throws Exception {
        String json = """
                {
                  "isMeeting": false,
                  "devices": ["A", "B"]
                }
                """;

        Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> payloadValidationService.validateLivekitRequest(objectMapper.readTree(json))
        );
    }
}
