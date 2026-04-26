import { Download, HardDriveDownload, RadioTower, SearchCheck } from "lucide-react";
import { Field, PrimaryButton, ResultPanel, SectionCard, StatusBadge } from "@/app/components/common";
import { api } from "@/app/lib/api";
import { toPuid } from "@/app/lib/utils";
import { useRequest } from "@/app/hooks/useRequest";
import { useMemo, useState } from "react";

export function RtcFilesPage() {
  const puInfo = useRequest<any>();
  const dialogs = useRequest<any>();
  const files = useRequest<any>();
  const [deviceId, setDeviceId] = useState("31011500991323310018");
  const puid = useMemo(() => toPuid(deviceId), [deviceId]);
  const [dialogPayload, setDialogPayload] = useState(`{"id":"${puid}","index":1,"sdp":"v=0..."}`);
  const [dialogId, setDialogId] = useState("");
  const [platformFilePayload, setPlatformFilePayload] = useState('{"page":0,"pageSize":10,"filter":{"fileType":["video"]}}');
  const [deviceFilePayload, setDeviceFilePayload] = useState('{"page":0,"pageSize":10,"filter":{"channelIndex":1,"fileType":["video"]}}');
  const [downloadInfo, setDownloadInfo] = useState({ fileid: "", puid: "" });

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1 className="page-title">私有 RTC 与文件</h1>
          <div className="page-subtitle">设备信息、webrtc / bvrtc 打开、会话关闭、平台文件检索、设备文件检索和下载入口都集中在这里。</div>
        </div>
        <div className="badge-row"><StatusBadge label={`自动推导 ${puid}`} color="#059669" background="rgba(16,185,129,0.1)" /></div>
      </div>

      <div className="split-two">
        <SectionCard title="RTC 实时流" icon={<RadioTower size={18} color="#10b981" />}>
          <div className="stack-16">
            <Field label="设备业务 ID（自动推导 puid）"><input className="input" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} /></Field>
            <div className="badge-row">
              <PrimaryButton loading={puInfo.loading} onClick={() => puInfo.run(() => api.get(`/bvcsp/v1/pu/info/${puid}`))}>获取设备信息</PrimaryButton>
            </div>
            <Field label="打开流 JSON"><textarea className="textarea" value={dialogPayload} onChange={(e) => setDialogPayload(e.target.value)} /></Field>
            <div className="badge-row">
              <PrimaryButton loading={dialogs.loading} onClick={() => dialogs.run(() => api.post("/bvcsp/v1/dialog/device/webrtc", JSON.parse(dialogPayload)))}>打开 WebRTC</PrimaryButton>
              <PrimaryButton loading={dialogs.loading} onClick={() => dialogs.run(() => api.post("/bvcsp/v1/dialog/device/bvrtc", JSON.parse(dialogPayload)))}>打开 BVRTC</PrimaryButton>
            </div>
            <Field label="dialogid"><input className="input" value={dialogId} onChange={(e) => setDialogId(e.target.value)} /></Field>
            <button className="button button-danger" onClick={() => dialogs.run(() => api.post(`/bvcsp/v1/dialog/close/${dialogId}`))}>关闭会话</button>
            <ResultPanel result={dialogs.result || puInfo.result} />
          </div>
        </SectionCard>

        <SectionCard title="平台 / 设备文件检索" icon={<SearchCheck size={18} color="#3b82f6" />}>
          <div className="stack-16">
            <Field label="平台文件检索 JSON"><textarea className="textarea" value={platformFilePayload} onChange={(e) => setPlatformFilePayload(e.target.value)} /></Field>
            <PrimaryButton loading={files.loading} onClick={() => files.run(() => api.post("/bvcsp/v1/recordfile/filter", JSON.parse(platformFilePayload)))}>平台文件检索</PrimaryButton>
            <Field label="设备文件检索 JSON"><textarea className="textarea" value={deviceFilePayload} onChange={(e) => setDeviceFilePayload(e.target.value)} /></Field>
            <PrimaryButton loading={files.loading} onClick={() => files.run(() => api.post(`/bvcsp/v1/pu/recordfile/filter/${puid}`, JSON.parse(deviceFilePayload)))}>设备文件检索</PrimaryButton>
            <div className="grid-2">
              <Field label="平台 fileid"><input className="input" value={downloadInfo.fileid} onChange={(e) => setDownloadInfo({ ...downloadInfo, fileid: e.target.value })} /></Field>
              <Field label="设备 puid"><input className="input" value={downloadInfo.puid} onChange={(e) => setDownloadInfo({ ...downloadInfo, puid: e.target.value })} placeholder={puid} /></Field>
            </div>
            <div className="badge-row">
              <a className="button button-secondary" href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/proxy"}/bvnru/v1/download/${downloadInfo.fileid}`} target="_blank" rel="noreferrer"><Download size={16} />下载平台文件</a>
              <a className="button button-secondary" href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/proxy"}/bvnru/v1/pu/download/${downloadInfo.puid || puid}/${downloadInfo.fileid}`} target="_blank" rel="noreferrer"><HardDriveDownload size={16} />下载设备文件</a>
            </div>
            <div className="soft-panel" style={{ padding: 14, fontSize: 12, color: "var(--text-soft)", lineHeight: 1.7 }}>
              如果下载接口因 `X-Access-Token` 头而非查询参数鉴权，建议后续我在后端补一个下载中转 helper 接口，前端即可彻底无感下载。
            </div>
            <ResultPanel result={files.result} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
