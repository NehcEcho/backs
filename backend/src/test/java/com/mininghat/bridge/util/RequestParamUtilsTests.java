package com.mininghat.bridge.util;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

class RequestParamUtilsTests {

    @Test
    void shouldRemoveBlankQueryParams() {
        MultiValueMap<String, String> source = new LinkedMultiValueMap<>();
        source.add("device_id", "  ");
        source.add("device_name", "测试设备");
        source.add("page_index", null);
        source.add("page_size", "10");

        MultiValueMap<String, String> cleaned = RequestParamUtils.clean(source);

        Assertions.assertFalse(cleaned.containsKey("device_id"));
        Assertions.assertEquals("测试设备", cleaned.getFirst("device_name"));
        Assertions.assertEquals("10", cleaned.getFirst("page_size"));
    }
}
