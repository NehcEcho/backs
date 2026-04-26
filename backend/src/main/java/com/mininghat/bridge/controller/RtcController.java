package com.mininghat.bridge.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.mininghat.bridge.model.GatewayResponse;
import com.mininghat.bridge.service.CompanyApiGateway;
import com.mininghat.bridge.service.PayloadValidationService;
import com.mininghat.bridge.support.ProxyResponseMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/proxy")
public class RtcController {

    private final CompanyApiGateway companyApiGateway;
    private final PayloadValidationService payloadValidationService;
    private final ProxyResponseMapper proxyResponseMapper;

    public RtcController(
            CompanyApiGateway companyApiGateway,
            PayloadValidationService payloadValidationService,
            ProxyResponseMapper proxyResponseMapper
    ) {
        this.companyApiGateway = companyApiGateway;
        this.payloadValidationService = payloadValidationService;
        this.proxyResponseMapper = proxyResponseMapper;
    }

    @GetMapping("/bvcsp/v1/pu/info/{puid}")
    public ResponseEntity<GatewayResponse> getPuInfo(
            @RequestHeader("X-Access-Token") String token,
            @PathVariable String puid
    ) {
        return proxyResponseMapper.toJsonResponse(companyApiGateway.get("/bvcsp/v1/pu/info/" + puid, token, null));
    }

    @PostMapping("/bvcsp/v1/dialog/device/webrtc")
    public ResponseEntity<GatewayResponse> openWebrtcDialog(
            @RequestHeader("X-Access-Token") String token,
            @RequestBody JsonNode body
    ) {
        payloadValidationService.validateRtcDialogRequest(body);
        return proxyResponseMapper.toJsonResponse(companyApiGateway.post("/bvcsp/v1/dialog/device/webrtc", token, body));
    }

    @PostMapping("/bvcsp/v1/dialog/device/bvrtc")
    public ResponseEntity<GatewayResponse> openBvrtcDialog(
            @RequestHeader("X-Access-Token") String token,
            @RequestBody JsonNode body
    ) {
        payloadValidationService.validateRtcDialogRequest(body);
        return proxyResponseMapper.toJsonResponse(companyApiGateway.post("/bvcsp/v1/dialog/device/bvrtc", token, body));
    }

    @PostMapping("/bvcsp/v1/dialog/close/{dialogid}")
    public ResponseEntity<GatewayResponse> closeDialog(
            @RequestHeader("X-Access-Token") String token,
            @PathVariable String dialogid
    ) {
        return proxyResponseMapper.toJsonResponse(companyApiGateway.post("/bvcsp/v1/dialog/close/" + dialogid, token, null));
    }

    @PostMapping("/bvcsp/v1/recordfile/filter")
    public ResponseEntity<GatewayResponse> filterPlatformRecordFiles(
            @RequestHeader("X-Access-Token") String token,
            @RequestBody JsonNode body
    ) {
        payloadValidationService.validateRecordFileFilter(body);
        return proxyResponseMapper.toJsonResponse(companyApiGateway.post("/bvcsp/v1/recordfile/filter", token, body));
    }

    @PostMapping("/bvcsp/v1/pu/recordfile/filter/{puid}")
    public ResponseEntity<GatewayResponse> filterDeviceRecordFiles(
            @RequestHeader("X-Access-Token") String token,
            @PathVariable String puid,
            @RequestBody JsonNode body
    ) {
        payloadValidationService.validateRecordFileFilter(body);
        return proxyResponseMapper.toJsonResponse(
                companyApiGateway.post("/bvcsp/v1/pu/recordfile/filter/" + puid, token, body)
        );
    }

    @GetMapping("/bvnru/v1/download/{fileid}")
    public ResponseEntity<?> downloadPlatformFile(
            @RequestHeader("X-Access-Token") String token,
            @PathVariable String fileid
    ) {
        return proxyResponseMapper.toDownloadResponse(
                companyApiGateway.download("/bvnru/v1/download/" + fileid, token),
                fileid + ".bin"
        );
    }

    @GetMapping("/bvnru/v1/pu/download/{puid}/{fileid}")
    public ResponseEntity<?> downloadDeviceFile(
            @RequestHeader("X-Access-Token") String token,
            @PathVariable String puid,
            @PathVariable String fileid
    ) {
        return proxyResponseMapper.toDownloadResponse(
                companyApiGateway.download("/bvnru/v1/pu/download/" + puid + "/" + fileid, token),
                fileid + ".bin"
        );
    }
}
