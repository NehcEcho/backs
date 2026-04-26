import { useEffect, useMemo, useState } from "react";
import { BellRing, Clock3, ListChecks, RefreshCw, ShieldAlert } from "lucide-react";
import { CompactTable, Field, PrimaryButton, ResultPanel, ResultSummary, SectionCard, StatusBadge } from "@/app/components/common";
import { appApi } from "@/app/lib/api";
import { useRequest } from "@/app/hooks/useRequest";

type OperationLog = {
  id?: number;
  method?: string;
  path?: string;
  statusCode?: number;
  success?: boolean;
  message?: string;
  createdAt?: string;
};

type AlarmSnapshot = {
  alarmId?: number;
  deviceId?: string;
  deviceName?: string;
  alarmName?: string;
  level?: string;
  status?: string;
  eventCode?: string;
  updatedAt?: string;
};

function unwrapArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.payload)) return value.payload;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

export function SafetyAlertPage() {
  const operationLogs = useRequest<any>();
  const alarmSnapshots = useRequest<any>();
  const [limit, setLimit] = useState("20");
  const [deviceId, setDeviceId] = useState("");

  const loadData = () => {
    void operationLogs.run(() => appApi.get(`/local/operation-logs?limit=${Number(limit) || 20}`));
    void alarmSnapshots.run(() => appApi.get(`/local/alarm-snapshots?limit=${Number(limit) || 20}${deviceId ? `&deviceId=${encodeURIComponent(deviceId)}` : ""}`));
  };

  useEffect(() => {
    loadData();
  }, []);

  const logItems = useMemo(() => unwrapArray(operationLogs.result?.data).slice(0, 6) as OperationLog[], [operationLogs.result]);
  const snapshotItems = useMemo(() => unwrapArray(alarmSnapshots.result?.data) as AlarmSnapshot[], [alarmSnapshots.result]);

  const logRows = useMemo(
    () => logItems.slice(0, 8).map((item) => [
      String(item.method || "-"),
      String(item.path || "-"),
      String(item.statusCode ?? "-"),
      item.success ? "成功" : "失败",
      String(item.createdAt || "-"),
    ]),
    [logItems],
  );

  const snapshotRows = useMemo(
    () => snapshotItems.slice(0, 8).map((item) => [
      String(item.alarmId ?? "-"),
      String(item.deviceId || "-"),
      String(item.alarmName || item.eventCode || "-"),
      String(item.level || "-"),
      String(item.status || "-"),
    ]),
    [snapshotItems],
  );

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1 className="page-title">调试记录</h1>
          <div className="page-subtitle">这里不再是静态说明页，直接读取本地落库的操作日志和报警快照，方便回看最近联调情况。</div>
        </div>
        <div className="badge-row">
          <StatusBadge label="本地联调记录已接通" color="#059669" background="rgba(16,185,129,0.1)" />
        </div>
      </div>

      <div className="split-two">
        <SectionCard title="筛选与刷新" icon={<RefreshCw size={18} color="#10b981" />}>
          <div className="stack-16">
            <div className="grid-2">
              <Field label="最近条数"><input className="input" value={limit} onChange={(e) => setLimit(e.target.value)} /></Field>
              <Field label="设备业务 ID（可选）" hint="用于过滤报警快照，不影响操作日志。"><input className="input" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} placeholder="31011500991323310018" /></Field>
            </div>
            <div className="badge-row">
              <PrimaryButton onClick={loadData} loading={operationLogs.loading || alarmSnapshots.loading}>刷新本地记录</PrimaryButton>
            </div>
            <ResultSummary
              title="本地记录摘要"
              items={[
                { label: "操作日志条数", value: String(logItems.length) },
                { label: "报警快照条数", value: String(snapshotItems.length) },
                { label: "当前过滤设备", value: deviceId || "全部设备" },
              ]}
            />
          </div>
        </SectionCard>

        <SectionCard title="最近告警快照" icon={<ShieldAlert size={18} color="#ef4444" />}>
          <div className="stack-16">
            <CompactTable title="最近报警快照表" columns={["Alarm ID", "设备号", "报警", "等级", "状态"]} rows={snapshotRows} />
            <ResultPanel result={alarmSnapshots.result} />
          </div>
        </SectionCard>
      </div>

      <SectionCard title="操作日志时间线" icon={<BellRing size={18} color="#ef4444" />}>
        <div className="stack-12">
          {logItems.map((item) => (
            <div key={`${item.id || item.createdAt}-${item.path}`} className="soft-panel" style={{ padding: 16, display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 38, height: 38, borderRadius: 14, display: "grid", placeItems: "center", background: item.success ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)" }}>
                <Clock3 size={16} color={item.success ? "#10b981" : "#ef4444"} />
              </div>
              <div className="stack-12" style={{ gap: 6, width: "100%" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{item.method || "HTTP"} {item.path || "-"}</span>
                  <span className="mini-meta">{item.createdAt || "-"}</span>
                  <StatusBadge label={item.success ? "成功" : "失败"} color={item.success ? "#059669" : "#dc2626"} background={item.success ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)"} />
                </div>
                <div style={{ fontSize: 13, color: "var(--text-soft)" }}>{item.message || `HTTP ${item.statusCode || 0}`}</div>
              </div>
            </div>
          ))}
          <CompactTable title="最近操作日志表" columns={["Method", "Path", "HTTP", "结果", "时间"]} rows={logRows} />
          <ResultPanel result={operationLogs.result} />
        </div>
      </SectionCard>
    </div>
  );
}
