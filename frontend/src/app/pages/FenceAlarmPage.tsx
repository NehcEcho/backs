import { useEffect, useMemo, useState } from "react";
import { BellRing, MapPinCheckInside, ShieldAlert, Siren, Waypoints } from "lucide-react";
import { CompactTable, DangerButton, Field, HintPanel, PrimaryButton, QuickFillButton, ResultPreviewList, ResultSummary, SectionCard, StatCard, StatusBadge } from "@/app/components/common";
import { useRequest } from "@/app/hooks/useRequest";
import { api } from "@/app/lib/api";
import { buildQuery, findArrayByObjectKeys, findFirstByKeys, formatNumber, safeText } from "@/app/lib/utils";

type FenceAsset = {
  id: string;
  name: string;
  shape: string;
  eventType: string;
  company: string;
  schedule: string;
  deviceCount: string;
};

type AlarmAsset = {
  id: string;
  deviceId: string;
  eventCode: string;
  level: string;
  handled: string;
  time: string;
  remark: string;
};

const fenceEventOptions = [
  { value: "11", label: "进入围栏" },
  { value: "12", label: "离开围栏" },
  { value: "13", label: "越界停留" },
];

const alarmLevelOptions = [
  { value: "", label: "全部等级" },
  { value: "low", label: "低" },
  { value: "medium", label: "中" },
  { value: "high", label: "高" },
];

function createDefaultFenceDraft() {
  return {
    fenceName: "东翼运输通道电子围栏",
    eventType: "11",
    fenceShape: "Circle",
    companyId: "",
    companyName: "",
    startTimeStr: "00:00",
    endTimeStr: "23:59",
    radius: "100",
    longitude: "116.397428",
    latitude: "39.90923",
    deviceIndexIds: "1",
  };
}

function createDefaultAlarmDraft() {
  return {
    remark: "已通知值守人员现场确认",
    level: "medium",
    handled: "true",
  };
}

function parseCsvNumbers(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));
}

function buildFencePayload(draft: ReturnType<typeof createDefaultFenceDraft>) {
  return {
    fenceName: draft.fenceName,
    startTimeStr: draft.startTimeStr,
    endTimeStr: draft.endTimeStr,
    eventType: Number(draft.eventType),
    deviceIndexIds: parseCsvNumbers(draft.deviceIndexIds),
    fenceShape: draft.fenceShape,
    companyId: draft.companyId ? Number(draft.companyId) : undefined,
    companyName: draft.companyName || undefined,
    circleFenceData: {
      radius: Number(draft.radius || 0),
      center: {
        longitude: draft.longitude,
        latitude: draft.latitude,
      },
    },
  };
}

function buildAlarmPayload(draft: ReturnType<typeof createDefaultAlarmDraft>) {
  return {
    remark: draft.remark || undefined,
    level: draft.level || undefined,
    handled: draft.handled,
  };
}

export function FenceAlarmPage() {
  const fenceList = useRequest<any>();
  const fenceDetail = useRequest<any>();
  const fenceMutation = useRequest<any>();
  const alarmList = useRequest<any>();
  const alarmUpdate = useRequest<any>();

  const [fenceFilter, setFenceFilter] = useState({
    is_page: true,
    page_index: 1,
    page_size: 12,
    event_type: "",
    fence_name: "",
    company_id: "",
    fence_shape: "",
  });
  const [alarmFilter, setAlarmFilter] = useState({
    is_page: true,
    page_index: 1,
    page_size: 12,
    device_id: "",
    level: "",
    event_code: "",
    handled: "",
  });
  const [fenceId, setFenceId] = useState("1");
  const [alarmId, setAlarmId] = useState("1");
  const [fenceDraft, setFenceDraft] = useState(createDefaultFenceDraft());
  const [alarmDraft, setAlarmDraft] = useState(createDefaultAlarmDraft());

  const latestFencePayload = fenceMutation.result?.data?.payload ?? fenceDetail.result?.data?.payload ?? fenceList.result?.data?.payload;
  const latestAlarmPayload = alarmUpdate.result?.data?.payload ?? alarmList.result?.data?.payload;

  const latestFenceId = useMemo(() => {
    const value = findFirstByKeys(latestFencePayload, ["id", "fenceId"]);
    return value === undefined ? "" : String(value);
  }, [latestFencePayload]);

  const latestAlarmId = useMemo(() => {
    const value = findFirstByKeys(latestAlarmPayload, ["id", "alarmId"]);
    return value === undefined ? "" : String(value);
  }, [latestAlarmPayload]);

  const latestAlarmDeviceId = useMemo(() => {
    const value = findFirstByKeys(latestAlarmPayload, ["device_id", "deviceId"]);
    return value === undefined ? "" : String(value);
  }, [latestAlarmPayload]);

  const fenceItems = useMemo(() => {
    return findArrayByObjectKeys(latestFencePayload, ["id", "fenceId", "fenceName", "fenceShape"]).slice(0, 18).map((item, index) => {
      const start = findFirstByKeys(item, ["startTimeStr"]);
      const end = findFirstByKeys(item, ["endTimeStr"]);
      const deviceIds = findFirstByKeys(item, ["deviceIndexIds"]);
      const count = Array.isArray(deviceIds) ? deviceIds.length : deviceIds ? String(deviceIds).split(",").filter(Boolean).length : 0;
      return {
        id: String(findFirstByKeys(item, ["id", "fenceId"]) ?? index + 1),
        name: String(findFirstByKeys(item, ["fenceName", "name"]) ?? `围栏 ${index + 1}`),
        shape: String(findFirstByKeys(item, ["fenceShape", "shape"]) ?? "Circle"),
        eventType: String(findFirstByKeys(item, ["eventType", "event_type"]) ?? "-") ,
        company: String(findFirstByKeys(item, ["companyName", "company_name"]) ?? "未分配单位"),
        schedule: [start ? String(start) : null, end ? String(end) : null].filter(Boolean).join(" - ") || "全天",
        deviceCount: String(count || 0),
      } as FenceAsset;
    });
  }, [latestFencePayload]);

  const alarmItems = useMemo(() => {
    return findArrayByObjectKeys(latestAlarmPayload, ["id", "alarmId", "device_id", "deviceId"]).slice(0, 18).map((item, index) => ({
      id: String(findFirstByKeys(item, ["id", "alarmId"]) ?? index + 1),
      deviceId: String(findFirstByKeys(item, ["device_id", "deviceId"]) ?? "-"),
      eventCode: String(findFirstByKeys(item, ["event_code", "eventCode"]) ?? "-"),
      level: String(findFirstByKeys(item, ["level"]) ?? "未分级"),
      handled: String(findFirstByKeys(item, ["handled"]) ?? "false"),
      time: String(findFirstByKeys(item, ["alarmTime", "time", "createTime"]) ?? "-"),
      remark: String(findFirstByKeys(item, ["remark", "message", "content"]) ?? "待补充处理说明"),
    })) as AlarmAsset[];
  }, [latestAlarmPayload]);

  const selectedFence = useMemo(() => {
    const detailPayload = fenceDetail.result?.data?.payload;
    const detailId = findFirstByKeys(detailPayload, ["id", "fenceId"]);
    if (detailId !== undefined) {
      const start = findFirstByKeys(detailPayload, ["startTimeStr"]);
      const end = findFirstByKeys(detailPayload, ["endTimeStr"]);
      const deviceIds = findFirstByKeys(detailPayload, ["deviceIndexIds"]);
      const count = Array.isArray(deviceIds) ? deviceIds.length : deviceIds ? String(deviceIds).split(",").filter(Boolean).length : 0;
      return {
        id: String(detailId),
        name: String(findFirstByKeys(detailPayload, ["fenceName", "name"]) ?? "未命名围栏"),
        shape: String(findFirstByKeys(detailPayload, ["fenceShape", "shape"]) ?? "Circle"),
        eventType: String(findFirstByKeys(detailPayload, ["eventType", "event_type"]) ?? "-"),
        company: String(findFirstByKeys(detailPayload, ["companyName", "company_name"]) ?? "未分配单位"),
        schedule: [start ? String(start) : null, end ? String(end) : null].filter(Boolean).join(" - ") || "全天",
        deviceCount: String(count || 0),
      } as FenceAsset;
    }
    return fenceItems.find((item) => item.id === fenceId) ?? fenceItems[0] ?? null;
  }, [fenceDetail.result, fenceItems, fenceId]);

  const selectedAlarm = useMemo(() => {
    return alarmItems.find((item) => item.id === alarmId) ?? alarmItems[0] ?? null;
  }, [alarmItems, alarmId]);

  const fencePreviewItems = useMemo(() => {
    return fenceItems.slice(0, 6).map((item) => ({
      id: item.id,
      title: item.name,
      meta: `ID ${item.id} | ${item.shape} | ${item.schedule}`,
      action: <QuickFillButton onClick={() => applyFence(item)}>查看围栏</QuickFillButton>,
    }));
  }, [fenceItems]);

  const alarmPreviewItems = useMemo(() => {
    return alarmItems.slice(0, 6).map((item) => ({
      id: item.id,
      title: `报警 ${item.id}`,
      meta: `设备 ${item.deviceId} | ${item.level} | ${item.time}`,
      action: <QuickFillButton onClick={() => applyAlarm(item)}>带入处理</QuickFillButton>,
    }));
  }, [alarmItems]);

  const alarmRows = useMemo(() => {
    return alarmItems.slice(0, 8).map((item) => [
      item.id,
      item.deviceId,
      item.eventCode,
      item.level,
      item.handled === "true" ? "已处理" : "待处理",
    ]);
  }, [alarmItems]);

  const stats = useMemo(
    () => [
      {
        label: "围栏数量",
        value: formatNumber(fenceItems.length || 0),
        trend: selectedFence ? `当前查看 ${selectedFence.name}` : "等待查询围栏",
        color: "#10b981",
        bg: "rgba(16,185,129,0.1)",
        icon: <MapPinCheckInside size={20} color="#10b981" />,
      },
      {
        label: "告警记录",
        value: formatNumber(alarmItems.length || 0),
        trend: latestAlarmDeviceId ? `最近设备 ${latestAlarmDeviceId}` : "等待查询报警",
        color: "#ef4444",
        bg: "rgba(239,68,68,0.1)",
        icon: <Siren size={20} color="#ef4444" />,
      },
      {
        label: "围栏覆盖设备",
        value: selectedFence?.deviceCount || "0",
        trend: selectedFence?.schedule || "根据选中围栏统计",
        color: "#3b82f6",
        bg: "rgba(59,130,246,0.1)",
        icon: <Waypoints size={20} color="#3b82f6" />,
      },
      {
        label: "待处理等级",
        value: selectedAlarm?.level || alarmDraft.level,
        trend: selectedAlarm?.remark || "用于交接值守人员",
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.1)",
        icon: <BellRing size={20} color="#f59e0b" />,
      },
    ],
    [alarmDraft.level, alarmItems.length, fenceItems.length, latestAlarmDeviceId, selectedAlarm, selectedFence],
  );

  useEffect(() => {
    void fenceList.run(() => api.get(`/v1/fences${buildQuery(fenceFilter)}`));
    void alarmList.run(() => api.get(`/v1/alarms${buildQuery(alarmFilter)}`));
  }, []);

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

  const applyFence = (asset: FenceAsset) => {
    setFenceId(asset.id);
    setFenceDraft((prev) => ({
      ...prev,
      fenceName: asset.name,
      fenceShape: asset.shape,
      eventType: asset.eventType !== "-" ? asset.eventType : prev.eventType,
      companyName: asset.company !== "未分配单位" ? asset.company : prev.companyName,
    }));
    void fenceDetail.run(() => api.get(`/v1/fences/${asset.id}`));
  };

  const applyAlarm = (asset: AlarmAsset) => {
    setAlarmId(asset.id);
    setAlarmFilter((prev) => ({ ...prev, device_id: asset.deviceId }));
    setAlarmDraft((prev) => ({
      ...prev,
      level: asset.level !== "未分级" ? asset.level : prev.level,
      handled: asset.handled,
      remark: asset.remark !== "待补充处理说明" ? asset.remark : prev.remark,
    }));
  };

  const saveFence = () => fenceMutation.run(() => api.post("/v1/fences", buildFencePayload(fenceDraft)));
  const updateFence = () => fenceMutation.run(() => api.put(`/v1/fences/${fenceId}`, buildFencePayload(fenceDraft)));
  const removeFence = () => fenceMutation.run(() => api.delete(`/v1/fences/${fenceId}`));
  const saveAlarm = () => alarmUpdate.run(() => api.put(`/v1/alarms/${alarmId}`, buildAlarmPayload(alarmDraft)));

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1 className="page-title">围栏与报警</h1>
          <div className="page-subtitle">面向值守与调度场景统一处理电子围栏、越界事件和人工闭环，不再展示原始 JSON 测试台。</div>
        </div>
        <div className="badge-row">
          <StatusBadge label="围栏策略已接通" color="#059669" background="rgba(16,185,129,0.1)" />
        </div>
      </div>

      <div className="grid-4">{stats.map((item) => <StatCard key={item.label} {...item} />)}</div>

      <div className="split-two">
        <SectionCard title="围栏资产总览" icon={<MapPinCheckInside size={18} color="#10b981" />}>
          <div className="stack-16">
            <HintPanel title="围栏检索" tone="info">
              先按围栏名称、事件类型或形状筛选，再从卡片进入围栏档案。选中的围栏会自动带入右侧维护区，适合班前核对和临时调整。
            </HintPanel>
            <div className="grid-2">
              <Field label="围栏名称"><input className="input" value={fenceFilter.fence_name} onChange={(e) => setFenceFilter({ ...fenceFilter, fence_name: e.target.value })} placeholder="如 东翼运输通道" /></Field>
              <Field label="围栏形状"><select className="select" value={fenceFilter.fence_shape} onChange={(e) => setFenceFilter({ ...fenceFilter, fence_shape: e.target.value })}><option value="">全部形状</option><option value="Circle">Circle</option><option value="Polygon">Polygon</option></select></Field>
              <Field label="事件类型"><select className="select" value={fenceFilter.event_type} onChange={(e) => setFenceFilter({ ...fenceFilter, event_type: e.target.value })}><option value="">全部事件</option>{fenceEventOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
              <Field label="公司 ID"><input className="input" value={fenceFilter.company_id} onChange={(e) => setFenceFilter({ ...fenceFilter, company_id: e.target.value })} placeholder="可选" /></Field>
            </div>
            <div className="badge-row">
              <PrimaryButton loading={fenceList.loading} onClick={() => fenceList.run(() => api.get(`/v1/fences${buildQuery(fenceFilter)}`))}>刷新围栏列表</PrimaryButton>
              <PrimaryButton loading={fenceDetail.loading} onClick={() => fenceDetail.run(() => api.get(`/v1/fences/${fenceId}`))}>读取围栏详情</PrimaryButton>
            </div>
            <ResultSummary
              title="围栏查询摘要"
              items={[
                { label: "当前围栏 ID", value: selectedFence?.id || latestFenceId || fenceId },
                { label: "围栏名称", value: selectedFence?.name || safeText(fenceFilter.fence_name) },
                { label: "生效时段", value: selectedFence?.schedule || "等待详情" },
                { label: "覆盖设备", value: selectedFence?.deviceCount || "0" },
              ]}
            />
            <div className="device-card-grid">
              {fenceItems.length ? fenceItems.map((asset) => {
                const active = selectedFence?.id === asset.id;
                return (
                  <button key={asset.id} className={`device-asset-card ${active ? "device-asset-card-active" : ""}`} onClick={() => applyFence(asset)}>
                    <div className="device-asset-top">
                      <div>
                        <div className="device-asset-name">{asset.name}</div>
                        <div className="device-asset-meta">围栏 ID {asset.id}</div>
                      </div>
                      <StatusBadge label={asset.shape} color="#10b981" background="rgba(16,185,129,0.1)" />
                    </div>
                    <div className="device-asset-meta">{asset.company}</div>
                    <div className="device-asset-footer">{asset.schedule} · 覆盖 {asset.deviceCount} 台设备</div>
                  </button>
                );
              }) : <div className="empty-hint">暂未查询到围栏，可调整条件后重新加载。</div>}
            </div>
            <ResultPreviewList title="最近围栏记录" items={fencePreviewItems} />
          </div>
        </SectionCard>

        <SectionCard title="围栏策略维护" icon={<ShieldAlert size={18} color="#f59e0b" />}>
          <div className="stack-16">
            <div className="device-profile-card">
              <div className="device-profile-avatar">围</div>
              <div>
                <div className="device-profile-title">{selectedFence?.name || fenceDraft.fenceName}</div>
                <div className="device-profile-subtitle">{selectedFence?.company || "用于围栏启停、范围和适用设备维护"}</div>
              </div>
            </div>
            <div className="device-detail-grid">
              <div className="device-detail-item"><span>围栏 ID</span><strong>{selectedFence?.id || fenceId}</strong></div>
              <div className="device-detail-item"><span>事件类型</span><strong>{selectedFence?.eventType || fenceDraft.eventType}</strong></div>
              <div className="device-detail-item"><span>围栏形状</span><strong>{selectedFence?.shape || fenceDraft.fenceShape}</strong></div>
              <div className="device-detail-item"><span>覆盖设备</span><strong>{selectedFence?.deviceCount || "0"}</strong></div>
            </div>
            <div className="grid-2">
              <Field label="围栏 ID"><input className="input" value={fenceId} onChange={(e) => setFenceId(e.target.value)} /></Field>
              <Field label="围栏名称"><input className="input" value={fenceDraft.fenceName} onChange={(e) => setFenceDraft({ ...fenceDraft, fenceName: e.target.value })} /></Field>
              <Field label="事件类型"><select className="select" value={fenceDraft.eventType} onChange={(e) => setFenceDraft({ ...fenceDraft, eventType: e.target.value })}>{fenceEventOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
              <Field label="围栏形状"><select className="select" value={fenceDraft.fenceShape} onChange={(e) => setFenceDraft({ ...fenceDraft, fenceShape: e.target.value })}><option value="Circle">Circle</option><option value="Polygon">Polygon</option></select></Field>
              <Field label="公司 ID"><input className="input" value={fenceDraft.companyId} onChange={(e) => setFenceDraft({ ...fenceDraft, companyId: e.target.value })} /></Field>
              <Field label="公司名称"><input className="input" value={fenceDraft.companyName} onChange={(e) => setFenceDraft({ ...fenceDraft, companyName: e.target.value })} placeholder="可选" /></Field>
              <Field label="开始时间"><input className="input" value={fenceDraft.startTimeStr} onChange={(e) => setFenceDraft({ ...fenceDraft, startTimeStr: e.target.value })} placeholder="00:00" /></Field>
              <Field label="结束时间"><input className="input" value={fenceDraft.endTimeStr} onChange={(e) => setFenceDraft({ ...fenceDraft, endTimeStr: e.target.value })} placeholder="23:59" /></Field>
              <Field label="圆心经度"><input className="input" value={fenceDraft.longitude} onChange={(e) => setFenceDraft({ ...fenceDraft, longitude: e.target.value })} /></Field>
              <Field label="圆心经度纬度"><input className="input" value={fenceDraft.latitude} onChange={(e) => setFenceDraft({ ...fenceDraft, latitude: e.target.value })} /></Field>
              <Field label="半径(米)"><input className="input" value={fenceDraft.radius} onChange={(e) => setFenceDraft({ ...fenceDraft, radius: e.target.value })} /></Field>
              <Field label="设备索引 ID 列表" hint="多个值用英文逗号分隔。"><input className="input" value={fenceDraft.deviceIndexIds} onChange={(e) => setFenceDraft({ ...fenceDraft, deviceIndexIds: e.target.value })} /></Field>
            </div>
            <div className="badge-row">
              <PrimaryButton loading={fenceMutation.loading} onClick={saveFence}>新增围栏</PrimaryButton>
              <PrimaryButton loading={fenceMutation.loading} onClick={updateFence}>保存调整</PrimaryButton>
              <DangerButton onClick={removeFence}>删除围栏</DangerButton>
            </div>
            {(fenceMutation.result?.ok === false || fenceDetail.result?.ok === false || fenceList.result?.ok === false) ? <HintPanel tone="warn" title="围栏操作提示">{fenceMutation.result?.error || fenceDetail.result?.error || fenceList.result?.error}</HintPanel> : null}
          </div>
        </SectionCard>
      </div>

      <div className="split-two">
        <SectionCard title="报警态势列表" icon={<BellRing size={18} color="#ef4444" />}>
          <div className="stack-16">
            <HintPanel title="值守视角" tone="info">
              报警先按设备号、事件代码和处理状态筛选，再把重点记录带入右侧处理区。适合交接班、复盘和人工闭环跟进。
            </HintPanel>
            <div className="grid-2">
              <Field label="设备业务号"><input className="input" value={alarmFilter.device_id} onChange={(e) => setAlarmFilter({ ...alarmFilter, device_id: e.target.value })} placeholder="自动带入最近报警设备" /></Field>
              <Field label="事件代码"><input className="input" value={alarmFilter.event_code} onChange={(e) => setAlarmFilter({ ...alarmFilter, event_code: e.target.value })} placeholder="如 10001" /></Field>
              <Field label="等级"><select className="select" value={alarmFilter.level} onChange={(e) => setAlarmFilter({ ...alarmFilter, level: e.target.value })}>{alarmLevelOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
              <Field label="处理状态"><select className="select" value={alarmFilter.handled} onChange={(e) => setAlarmFilter({ ...alarmFilter, handled: e.target.value })}><option value="">全部状态</option><option value="true">已处理</option><option value="false">待处理</option></select></Field>
            </div>
            <div className="badge-row">
              <PrimaryButton loading={alarmList.loading} onClick={() => alarmList.run(() => api.get(`/v1/alarms${buildQuery(alarmFilter)}`))}>刷新报警列表</PrimaryButton>
              {latestAlarmDeviceId ? <QuickFillButton onClick={() => setAlarmFilter((prev) => ({ ...prev, device_id: latestAlarmDeviceId }))}>带入最近设备号</QuickFillButton> : null}
              {latestAlarmId ? <QuickFillButton onClick={() => setAlarmId(latestAlarmId)}>带入最近报警</QuickFillButton> : null}
            </div>
            <ResultSummary
              title="报警查询摘要"
              items={[
                { label: "报警 ID", value: selectedAlarm?.id || latestAlarmId || alarmId },
                { label: "设备业务号", value: selectedAlarm?.deviceId || latestAlarmDeviceId || alarmFilter.device_id },
                { label: "事件代码", value: selectedAlarm?.eventCode || safeText(alarmFilter.event_code) },
                { label: "处理状态", value: selectedAlarm ? (selectedAlarm.handled === "true" ? "已处理" : "待处理") : safeText(alarmFilter.handled) },
              ]}
            />
            <ResultPreviewList title="最近报警记录" items={alarmPreviewItems} />
            <CompactTable title="重点报警列表" columns={["报警 ID", "设备号", "事件代码", "等级", "状态"]} rows={alarmRows} />
          </div>
        </SectionCard>

        <SectionCard title="报警处理闭环" icon={<ShieldAlert size={18} color="#8b5cf6" />}>
          <div className="stack-16">
            <div className="device-profile-card">
              <div className="device-profile-avatar" style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.88), rgba(245,158,11,0.9))" }}>警</div>
              <div>
                <div className="device-profile-title">{selectedAlarm ? `报警 ${selectedAlarm.id}` : `报警 ${alarmId}`}</div>
                <div className="device-profile-subtitle">{selectedAlarm?.remark || "填写处理说明后提交，完成人工闭环。"}</div>
              </div>
            </div>
            <div className="device-detail-grid">
              <div className="device-detail-item"><span>设备业务号</span><strong>{selectedAlarm?.deviceId || latestAlarmDeviceId || "-"}</strong></div>
              <div className="device-detail-item"><span>报警等级</span><strong>{selectedAlarm?.level || alarmDraft.level}</strong></div>
              <div className="device-detail-item"><span>报警时间</span><strong>{selectedAlarm?.time || "-"}</strong></div>
              <div className="device-detail-item"><span>当前状态</span><strong>{selectedAlarm?.handled === "true" || alarmDraft.handled === "true" ? "已处理" : "待处理"}</strong></div>
            </div>
            <Field label="报警 ID"><input className="input" value={alarmId} onChange={(e) => setAlarmId(e.target.value)} /></Field>
            <div className="grid-2">
              <Field label="处理等级"><select className="select" value={alarmDraft.level} onChange={(e) => setAlarmDraft({ ...alarmDraft, level: e.target.value })}>{alarmLevelOptions.filter((option) => option.value).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
              <Field label="处理状态"><select className="select" value={alarmDraft.handled} onChange={(e) => setAlarmDraft({ ...alarmDraft, handled: e.target.value })}><option value="true">已处理</option><option value="false">待处理</option></select></Field>
            </div>
            <Field label="处理备注"><textarea className="textarea" value={alarmDraft.remark} onChange={(e) => setAlarmDraft({ ...alarmDraft, remark: e.target.value })} placeholder="例如：已电话通知班组长，要求 10 分钟内复核现场。" /></Field>
            <div className="badge-row">
              <PrimaryButton loading={alarmUpdate.loading} onClick={saveAlarm}>提交处理结果</PrimaryButton>
              {selectedAlarm ? <QuickFillButton onClick={() => applyAlarm(selectedAlarm)}>同步当前记录</QuickFillButton> : null}
            </div>
            {(alarmUpdate.result?.ok === false || alarmList.result?.ok === false) ? <HintPanel tone="warn" title="报警处理提示">{alarmUpdate.result?.error || alarmList.result?.error}</HintPanel> : null}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
