import { Camera, Radio, Webhook } from "lucide-react";
import { Field, PrimaryButton, ResultPanel, SectionCard, StatusBadge } from "@/app/components/common";
import { api } from "@/app/lib/api";
import { useRequest } from "@/app/hooks/useRequest";
import { useState } from "react";

export function LiveKitPage() {
  const tokenInfo = useRequest<any>();
  const serverInfo = useRequest<any>();
  const [payload, setPayload] = useState('{"isMeeting":false,"roomName":"debug-room","devices":["31011500991323310018"],"cameraEnabled":true,"microphoneEnabled":true}');

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1 className="page-title">LiveKit</h1>
          <div className="page-subtitle">对接 `/webrtc/token` 与后端扩展的 `/webrtc/server-info`，填入房间和设备即可生成 token。</div>
        </div>
        <div className="badge-row"><StatusBadge label="支持单设备与会议模式" color="#059669" background="rgba(16,185,129,0.1)" /></div>
      </div>

      <div className="split-two">
        <SectionCard title="生成房间 Token" icon={<Radio size={18} color="#10b981" />}>
          <div className="stack-16">
            <Field label="请求 JSON"><textarea className="textarea" value={payload} onChange={(e) => setPayload(e.target.value)} /></Field>
            <div className="badge-row">
              <PrimaryButton loading={tokenInfo.loading} onClick={() => tokenInfo.run(() => api.post("/webrtc/token", JSON.parse(payload)))}><Camera size={16} />生成 Token</PrimaryButton>
            </div>
            <ResultPanel result={tokenInfo.result} />
          </div>
        </SectionCard>

        <SectionCard title="服务地址信息" icon={<Webhook size={18} color="#3b82f6" />}>
          <div className="stack-16">
            <PrimaryButton loading={serverInfo.loading} onClick={() => serverInfo.run(() => api.get("/webrtc/server-info"))}>读取 LiveKit Server</PrimaryButton>
            <ResultPanel result={serverInfo.result} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
