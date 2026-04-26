import { BellRing, MapPinCheckInside, ShieldAlert } from "lucide-react";
import { Field, HintPanel, JsonErrorNotice, PrimaryButton, QuickFillButton, ResultPanel, ResultPreviewList, ResultSummary, SectionCard, StatusBadge } from "@/app/components/common";
import { api } from "@/app/lib/api";
import { buildQuery, findArrayByObjectKeys, findFirstByKeys, parseJsonInput } from "@/app/lib/utils";
import { useRequest } from "@/app/hooks/useRequest";
import { useEffect, useMemo, useState } from "react";

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

  const fenceJson = useMemo(() => parseJsonInput(fencePayload), [fencePayload]);
  const alarmJson = useMemo(() => parseJsonInput(alarmPayload), [alarmPayload]);

  const latestFenceId = useMemo(() => {
    const value = findFirstByKeys(fenceMutation.result?.data?.payload ?? fenceList.result?.data?.payload, ["id", "fenceId"]);
    return value === undefined ? "" : String(value);
  }, [fenceList.result, fenceMutation.result]);

  const latestAlarmId = useMemo(() => {
    const value = findFirstByKeys(alarmUpdate.result?.data?.payload ?? alarmList.result?.data?.payload, ["id", "alarmId"]);
    return value === undefined ? "" : String(value);
  }, [alarmList.result, alarmUpdate.result]);

  const latestAlarmDeviceId = useMemo(() => {
    const value = findFirstByKeys(alarmList.result?.data?.payload, ["device_id", "deviceId"]);
    return value === undefined ? "" : String(value);
  }, [alarmList.result]);

  const fencePreviewItems = useMemo(() => {
    const items = findArrayByObjectKeys(fenceList.result?.data?.payload, ["id", "fenceName", "fenceShape"]).slice(0, 4);
    return items.map((item, index) => {
      const id = findFirstByKeys(item, ["id", "fenceId"]);
      const name = findFirstByKeys(item, ["fenceName", "name"]);
      const shape = findFirstByKeys(item, ["fenceShape", "shape"]);
      return {
        id: `${id || name || index}`,
        title: name ? String(name) : `围栏 ${index + 1}`,
        meta: [id ? `ID ${String(id)}` : null, shape ? `形状 ${String(shape)}` : null].filter(Boolean).join(" | "),
        action: id ? <QuickFillButton onClick={() => setFenceId(String(id))}>带入围栏</QuickFillButton> : undefined,
      };
    });
  }, [fenceList.result]);

  const alarmPreviewItems = useMemo(() => {
    const items = findArrayByObjectKeys(alarmList.result?.data?.payload, ["id", "alarmId", "device_id", "deviceId"]).slice(0, 4);
    return items.map((item, index) => {
      const id = findFirstByKeys(item, ["id", "alarmId"]);
      const device = findFirstByKeys(item, ["device_id", "deviceId"]);
      const level = findFirstByKeys(item, ["level"]);
      const time = findFirstByKeys(item, ["alarmTime", "time", "createTime"]);
      return {
        id: `${id || device || index}`,
        title: id ? `报警 ${String(id)}` : `报警记录 ${index + 1}`,
        meta: [device ? `设备 ${String(device)}` : null, level ? `等级 ${String(level)}` : null, time ? `时间 ${String(time)}` : null].filter(Boolean).join(" | "),
        action: id ? <QuickFillButton onClick={() => setAlarmId(String(id))}>带入处理</QuickFillButton> : undefined,
      };
    });
  }, [alarmList.result]);

  useEffect(() => {
    if (!latestFenceId) return;
    setFenceId(latestFenceId);
  }, [latestFenceId]);

  useEffect(() => {
    if (!latestAlarmId) return;
    setAlarmId(latestAlarmId);
  }, [latestAlarmId]);

  useEffect(() => {
    if (!latestAlarmDeviceId) return;
    setAlarmFilter((prev) => ({ ...prev, device_id: latestAlarmDeviceId }));
  }, [latestAlarmDeviceId]);

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
            <HintPanel title="推荐流程" tone="info">
              先按名称或形状查围栏列表，确认返回里的 `id` 后再做详情、更新或删除。下面的快捷按钮会优先带入最近一次查询/变更结果中的围栏 ID。
            </HintPanel>
            <div className="grid-2">
              <Field label="围栏名称"><input className="input" value={fenceFilter.fence_name} onChange={(e) => setFenceFilter({ ...fenceFilter, fence_name: e.target.value })} /></Field>
              <Field label="形状"><input className="input" value={fenceFilter.fence_shape} onChange={(e) => setFenceFilter({ ...fenceFilter, fence_shape: e.target.value })} placeholder="Circle / Polygon" /></Field>
            </div>
            <div className="badge-row">
              <PrimaryButton loading={fenceList.loading} onClick={() => fenceList.run(() => api.get(`/v1/fences${buildQuery(fenceFilter)}`))}>查询围栏列表</PrimaryButton>
              <PrimaryButton loading={fenceList.loading} onClick={() => fenceList.run(() => api.get(`/v1/fences/${fenceId}`))}>查询围栏详情</PrimaryButton>
              {latestFenceId ? <QuickFillButton onClick={() => setFenceId(latestFenceId)}>使用最近围栏 ID：{latestFenceId}</QuickFillButton> : null}
            </div>
            <Field label="围栏 ID" hint="通常来自围栏列表或新增围栏结果中的 id 字段。"><input className="input" value={fenceId} onChange={(e) => setFenceId(e.target.value)} /></Field>
            <ResultSummary
              title="围栏结果摘要"
              items={[
                { label: "最近围栏 ID", value: latestFenceId, action: latestFenceId ? <QuickFillButton onClick={() => setFenceId(latestFenceId)}>带入详情</QuickFillButton> : null },
                { label: "筛选名称", value: fenceFilter.fence_name },
                { label: "筛选形状", value: fenceFilter.fence_shape },
              ]}
            />
            <ResultPreviewList title="最近围栏记录" items={fencePreviewItems} />
            <ResultPanel result={fenceList.result} />
          </div>
        </SectionCard>

        <SectionCard title="围栏新增 / 更新 / 删除" icon={<ShieldAlert size={18} color="#f59e0b" />}>
          <div className="stack-16">
            <HintPanel title="JSON 契约" tone="info">
              这里保留原始 JSON 方式，方便你和后端字段一一对照。若 JSON 无法解析，提交按钮会自动禁用，避免点击时报错。
            </HintPanel>
            <Field label="围栏 ID（更新/删除用）"><input className="input" value={fenceId} onChange={(e) => setFenceId(e.target.value)} /></Field>
            <Field label="请求 JSON"><textarea className="textarea" value={fencePayload} onChange={(e) => setFencePayload(e.target.value)} /></Field>
            <JsonErrorNotice error={fenceJson.ok ? null : fenceJson.error} />
            <div className="badge-row">
              <PrimaryButton loading={fenceMutation.loading} disabled={!fenceJson.ok} onClick={() => fenceJson.ok && fenceMutation.run(() => api.post("/v1/fences", fenceJson.data))}>新增围栏</PrimaryButton>
              <PrimaryButton loading={fenceMutation.loading} disabled={!fenceJson.ok} onClick={() => fenceJson.ok && fenceMutation.run(() => api.put(`/v1/fences/${fenceId}`, fenceJson.data))}>更新围栏</PrimaryButton>
              <button className="button button-danger" onClick={() => fenceMutation.run(() => api.delete(`/v1/fences/${fenceId}`))}>删除围栏</button>
              {latestFenceId ? <QuickFillButton onClick={() => setFenceId(latestFenceId)}>带入最近围栏 ID</QuickFillButton> : null}
            </div>
            <ResultPanel result={fenceMutation.result} />
          </div>
        </SectionCard>
      </div>

      <div className="split-two">
        <SectionCard title="报警列表" icon={<BellRing size={18} color="#ef4444" />}>
          <div className="stack-16">
            <HintPanel title="过滤建议" tone="info">
              报警列表建议先按 `device_id` 或 `event_code` 缩小范围，再决定是否处理。查询结果里的最近报警 ID 和设备号可以直接带入右侧更新区或当前过滤区。
            </HintPanel>
            <div className="grid-2">
              <Field label="设备 ID"><input className="input" value={alarmFilter.device_id} onChange={(e) => setAlarmFilter({ ...alarmFilter, device_id: e.target.value })} /></Field>
              <Field label="事件代码"><input className="input" value={alarmFilter.event_code} onChange={(e) => setAlarmFilter({ ...alarmFilter, event_code: e.target.value })} /></Field>
            </div>
            <div className="grid-2">
              <Field label="等级"><input className="input" value={alarmFilter.level} onChange={(e) => setAlarmFilter({ ...alarmFilter, level: e.target.value })} /></Field>
              <Field label="handled"><input className="input" value={alarmFilter.handled} onChange={(e) => setAlarmFilter({ ...alarmFilter, handled: e.target.value })} /></Field>
            </div>
            <div className="badge-row">
              <PrimaryButton loading={alarmList.loading} onClick={() => alarmList.run(() => api.get(`/v1/alarms${buildQuery(alarmFilter)}`))}>查询报警</PrimaryButton>
              {latestAlarmDeviceId ? <QuickFillButton onClick={() => setAlarmFilter((prev) => ({ ...prev, device_id: latestAlarmDeviceId }))}>使用最近报警设备号</QuickFillButton> : null}
              {latestAlarmId ? <QuickFillButton onClick={() => setAlarmId(latestAlarmId)}>带入最近报警 ID</QuickFillButton> : null}
            </div>
            <ResultSummary
              title="报警结果摘要"
              items={[
                { label: "最近报警 ID", value: latestAlarmId, action: latestAlarmId ? <QuickFillButton onClick={() => setAlarmId(latestAlarmId)}>带入处理</QuickFillButton> : null },
                { label: "最近设备号", value: latestAlarmDeviceId, action: latestAlarmDeviceId ? <QuickFillButton onClick={() => setAlarmFilter((prev) => ({ ...prev, device_id: latestAlarmDeviceId }))}>带入过滤</QuickFillButton> : null },
                { label: "当前事件代码", value: alarmFilter.event_code },
              ]}
            />
            <ResultPreviewList title="最近报警记录" items={alarmPreviewItems} />
            <ResultPanel result={alarmList.result} />
          </div>
        </SectionCard>

        <SectionCard title="报警处理更新" icon={<ShieldAlert size={18} color="#8b5cf6" />}>
          <div className="stack-16">
            <HintPanel title="处理更新" tone="info">
              修改 `remark`、`level` 或 `handled` 后直接提交即可。常见流程是从左侧列表取一个报警 ID，再在这里补处理备注。
            </HintPanel>
            <Field label="报警 ID" hint="通常来自报警列表结果中的 id 字段。"><input className="input" value={alarmId} onChange={(e) => setAlarmId(e.target.value)} /></Field>
            <Field label="更新 JSON"><textarea className="textarea" value={alarmPayload} onChange={(e) => setAlarmPayload(e.target.value)} /></Field>
            <JsonErrorNotice error={alarmJson.ok ? null : alarmJson.error} />
            <div className="badge-row">
              <PrimaryButton loading={alarmUpdate.loading} disabled={!alarmJson.ok} onClick={() => alarmJson.ok && alarmUpdate.run(() => api.put(`/v1/alarms/${alarmId}`, alarmJson.data))}>更新报警记录</PrimaryButton>
              {latestAlarmId ? <QuickFillButton onClick={() => setAlarmId(latestAlarmId)}>使用最近报警 ID：{latestAlarmId}</QuickFillButton> : null}
            </div>
            <ResultSummary
              title="处理更新摘要"
              items={[
                { label: "当前报警 ID", value: alarmId },
                { label: "处理等级", value: alarmJson.ok && typeof alarmJson.data === "object" && alarmJson.data && "level" in alarmJson.data ? String((alarmJson.data as Record<string, unknown>).level ?? "") : "" },
                { label: "handled", value: alarmJson.ok && typeof alarmJson.data === "object" && alarmJson.data && "handled" in alarmJson.data ? String((alarmJson.data as Record<string, unknown>).handled ?? "") : "" },
              ]}
            />
            <ResultPanel result={alarmUpdate.result} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
