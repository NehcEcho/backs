import { BellRing, MapPinCheckInside, ShieldAlert } from "lucide-react";
import { Field, PrimaryButton, ResultPanel, SectionCard, StatusBadge } from "@/app/components/common";
import { api } from "@/app/lib/api";
import { buildQuery } from "@/app/lib/utils";
import { useRequest } from "@/app/hooks/useRequest";
import { useState } from "react";

export function FenceAlarmPage() {
  const fenceList = useRequest<any>();
  const fenceMutation = useRequest<any>();
  const alarmList = useRequest<any>();
  const alarmUpdate = useRequest<any>();
  const [fenceFilter, setFenceFilter] = useState({ is_page: true, page_index: 1, page_size: 10, event_type: "", fence_name: "", company_id: "", fence_shape: "" });
  const [fenceId, setFenceId] = useState("1");
  const [fencePayload, setFencePayload] = useState('{"fenceName":"测试围栏","startTimeStr":"00:00","endTimeStr":"00:00","eventType":11,"deviceIndexIds":[1],"fenceShape":"Circle","circleFenceData":{"radius":100,"center":{"longitude":"116.397428","latitude":"39.90923"}}}');
  const [alarmFilter, setAlarmFilter] = useState({ is_page: true, page_index: 1, page_size: 10, device_id: "", level: "", event_code: "", handled: "" });
  const [alarmId, setAlarmId] = useState("1");
  const [alarmPayload, setAlarmPayload] = useState('{"remark":"已人工确认","level":"medium","handled":"true"}');

  const parse = (text: string) => JSON.parse(text);

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1 className="page-title">围栏报警</h1>
          <div className="page-subtitle">涵盖围栏增删改查与报警列表、处理更新，使用 JSON 直连以保持和后端契约一致。</div>
        </div>
        <div className="badge-row"><StatusBadge label="支持 Circle / Polygon" color="#059669" background="rgba(16,185,129,0.1)" /></div>
      </div>

      <div className="split-two">
        <SectionCard title="围栏列表与详情" icon={<MapPinCheckInside size={18} color="#10b981" />}>
          <div className="stack-16">
            <div className="grid-2">
              <Field label="围栏名称"><input className="input" value={fenceFilter.fence_name} onChange={(e) => setFenceFilter({ ...fenceFilter, fence_name: e.target.value })} /></Field>
              <Field label="形状"><input className="input" value={fenceFilter.fence_shape} onChange={(e) => setFenceFilter({ ...fenceFilter, fence_shape: e.target.value })} placeholder="Circle / Polygon" /></Field>
            </div>
            <div className="badge-row">
              <PrimaryButton loading={fenceList.loading} onClick={() => fenceList.run(() => api.get(`/v1/fences${buildQuery(fenceFilter)}`))}>查询围栏列表</PrimaryButton>
              <PrimaryButton loading={fenceList.loading} onClick={() => fenceList.run(() => api.get(`/v1/fences/${fenceId}`))}>查询围栏详情</PrimaryButton>
            </div>
            <Field label="围栏 ID"><input className="input" value={fenceId} onChange={(e) => setFenceId(e.target.value)} /></Field>
            <ResultPanel result={fenceList.result} />
          </div>
        </SectionCard>

        <SectionCard title="围栏新增 / 更新 / 删除" icon={<ShieldAlert size={18} color="#f59e0b" />}>
          <div className="stack-16">
            <Field label="围栏 ID（更新/删除用）"><input className="input" value={fenceId} onChange={(e) => setFenceId(e.target.value)} /></Field>
            <Field label="请求 JSON"><textarea className="textarea" value={fencePayload} onChange={(e) => setFencePayload(e.target.value)} /></Field>
            <div className="badge-row">
              <PrimaryButton loading={fenceMutation.loading} onClick={() => fenceMutation.run(() => api.post("/v1/fences", parse(fencePayload)))}>新增围栏</PrimaryButton>
              <PrimaryButton loading={fenceMutation.loading} onClick={() => fenceMutation.run(() => api.put(`/v1/fences/${fenceId}`, parse(fencePayload)))}>更新围栏</PrimaryButton>
              <button className="button button-danger" onClick={() => fenceMutation.run(() => api.delete(`/v1/fences/${fenceId}`))}>删除围栏</button>
            </div>
            <ResultPanel result={fenceMutation.result} />
          </div>
        </SectionCard>
      </div>

      <div className="split-two">
        <SectionCard title="报警列表" icon={<BellRing size={18} color="#ef4444" />}>
          <div className="stack-16">
            <div className="grid-2">
              <Field label="设备 ID"><input className="input" value={alarmFilter.device_id} onChange={(e) => setAlarmFilter({ ...alarmFilter, device_id: e.target.value })} /></Field>
              <Field label="事件代码"><input className="input" value={alarmFilter.event_code} onChange={(e) => setAlarmFilter({ ...alarmFilter, event_code: e.target.value })} /></Field>
            </div>
            <div className="grid-2">
              <Field label="等级"><input className="input" value={alarmFilter.level} onChange={(e) => setAlarmFilter({ ...alarmFilter, level: e.target.value })} /></Field>
              <Field label="handled"><input className="input" value={alarmFilter.handled} onChange={(e) => setAlarmFilter({ ...alarmFilter, handled: e.target.value })} /></Field>
            </div>
            <PrimaryButton loading={alarmList.loading} onClick={() => alarmList.run(() => api.get(`/v1/alarms${buildQuery(alarmFilter)}`))}>查询报警</PrimaryButton>
            <ResultPanel result={alarmList.result} />
          </div>
        </SectionCard>

        <SectionCard title="报警处理更新" icon={<ShieldAlert size={18} color="#8b5cf6" />}>
          <div className="stack-16">
            <Field label="报警 ID"><input className="input" value={alarmId} onChange={(e) => setAlarmId(e.target.value)} /></Field>
            <Field label="更新 JSON"><textarea className="textarea" value={alarmPayload} onChange={(e) => setAlarmPayload(e.target.value)} /></Field>
            <PrimaryButton loading={alarmUpdate.loading} onClick={() => alarmUpdate.run(() => api.put(`/v1/alarms/${alarmId}`, parse(alarmPayload)))}>更新报警记录</PrimaryButton>
            <ResultPanel result={alarmUpdate.result} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
