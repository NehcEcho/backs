import { useEffect, useMemo, useState } from "react";
import { BellRing, DatabaseZap, HardDrive, RefreshCw, Save } from "lucide-react";
import { CompactTable, Field, HintPanel, PrimaryButton, ResultPanel, ResultSummary, SectionCard, StatusBadge } from "@/app/components/common";
import { appApi } from "@/app/lib/api";
import { parseJsonInput, prettyJson } from "@/app/lib/utils";
import { useRequest } from "@/app/hooks/useRequest";

type AppSettingRecord = {
  category?: string;
  key?: string;
  value?: string;
  description?: string;
  updatedAt?: string;
};

type OperationLogRecord = {
  id?: number;
  method?: string;
  path?: string;
  statusCode?: number;
  success?: boolean;
  message?: string;
  requestQuery?: string;
  requestBody?: string;
  responseBody?: string;
  createdAt?: string;
};

type AlarmSnapshotRecord = {
  alarmId?: number;
  deviceId?: string;
  deviceName?: string;
  alarmName?: string;
  level?: string;
  status?: string;
  eventCode?: string;
  remark?: string;
  rawPayload?: string;
  updatedAt?: string;
};

function unwrapArray<T>(value: any): T[] {
  if (Array.isArray(value)) return value as T[];
  if (Array.isArray(value?.payload)) return value.payload as T[];
  if (Array.isArray(value?.data)) return value.data as T[];
  return [];
}

export function LocalWorkbenchPage() {
  const settings = useRequest<any>();
  const saveSetting = useRequest<any>();
  const logs = useRequest<any>();
  const snapshots = useRequest<any>();

  const [settingsCategory, setSettingsCategory] = useState("");
  const [settingForm, setSettingForm] = useState({ category: "map", key: "defaultZoom", value: "13", description: "Default map zoom level" });
  const [logLimit, setLogLimit] = useState("20");
  const [snapshotLimit, setSnapshotLimit] = useState("20");
  const [snapshotDeviceId, setSnapshotDeviceId] = useState("");
  const [selectedLog, setSelectedLog] = useState<OperationLogRecord | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<AlarmSnapshotRecord | null>(null);

  const loadSettings = () => settings.run(() => appApi.get(`/local/settings${settingsCategory ? `?category=${encodeURIComponent(settingsCategory)}` : ""}`));
  const loadLogs = () => logs.run(() => appApi.get(`/local/operation-logs?limit=${Number(logLimit) || 20}`));
  const loadSnapshots = () => snapshots.run(() => appApi.get(`/local/alarm-snapshots?limit=${Number(snapshotLimit) || 20}${snapshotDeviceId ? `&deviceId=${encodeURIComponent(snapshotDeviceId)}` : ""}`));

  useEffect(() => {
    void loadSettings();
    void loadLogs();
    void loadSnapshots();
  }, []);

  const settingItems = useMemo(() => unwrapArray<AppSettingRecord>(settings.result?.data), [settings.result]);
  const logItems = useMemo(() => unwrapArray<OperationLogRecord>(logs.result?.data), [logs.result]);
  const snapshotItems = useMemo(() => unwrapArray<AlarmSnapshotRecord>(snapshots.result?.data), [snapshots.result]);

  const settingRows = useMemo(
    () => settingItems.map((item) => [String(item.category || "-"), String(item.key || "-"), String(item.value || "-"), String(item.updatedAt || "-")]),
    [settingItems],
  );

  const logRows = useMemo(
    () => logItems.slice(0, 10).map((item) => [
      String(item.method || "-"),
      String(item.path || "-"),
      String(item.statusCode ?? "-"),
      item.success ? "成功" : "失败",
      item.id ? <button className="button button-secondary quick-fill-button" type="button" onClick={() => setSelectedLog(item)}>查看详情</button> : "-",
    ]),
    [logItems],
  );

  const snapshotRows = useMemo(
    () => snapshotItems.slice(0, 10).map((item) => [
      String(item.alarmId ?? "-"),
      String(item.deviceId || "-"),
      String(item.alarmName || item.eventCode || "-"),
      String(item.level || "-"),
      item.alarmId ? <button className="button button-secondary quick-fill-button" type="button" onClick={() => setSelectedSnapshot(item)}>查看详情</button> : "-",
    ]),
    [snapshotItems],
  );

  const selectedSnapshotPayload = useMemo(() => {
    if (!selectedSnapshot?.rawPayload) return null;
    const parsed = parseJsonInput(selectedSnapshot.rawPayload);
    return parsed.ok ? parsed.data : selectedSnapshot.rawPayload;
  }, [selectedSnapshot]);

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1 className="page-title">本地工位</h1>
          <div className="page-subtitle">集中管理本地设置、最近操作日志和告警快照。这里就是给联调用的内部工作台。</div>
        </div>
        <div className="badge-row">
          <StatusBadge label="SQLite 本地能力已接通" color="#059669" background="rgba(16,185,129,0.1)" />
        </div>
      </div>

      <div className="split-two">
        <SectionCard title="本地设置" icon={<DatabaseZap size={18} color="#10b981" />}>
          <div className="stack-16">
            <HintPanel title="设置用途" tone="info">
              可用于维护地图中心点、默认缩放等本地运行参数。下面支持按分类筛选，也支持直接改写某个设置项。
            </HintPanel>
            <div className="grid-2">
              <Field label="筛选分类"><input className="input" value={settingsCategory} onChange={(e) => setSettingsCategory(e.target.value)} placeholder="如 map" /></Field>
              <Field label="更新分类"><input className="input" value={settingForm.category} onChange={(e) => setSettingForm((prev) => ({ ...prev, category: e.target.value }))} /></Field>
            </div>
            <div className="grid-2">
              <Field label="设置键"><input className="input" value={settingForm.key} onChange={(e) => setSettingForm((prev) => ({ ...prev, key: e.target.value }))} /></Field>
              <Field label="设置值"><input className="input" value={settingForm.value} onChange={(e) => setSettingForm((prev) => ({ ...prev, value: e.target.value }))} /></Field>
            </div>
            <Field label="描述"><input className="input" value={settingForm.description} onChange={(e) => setSettingForm((prev) => ({ ...prev, description: e.target.value }))} /></Field>
            <div className="badge-row">
              <PrimaryButton onClick={() => loadSettings()} loading={settings.loading}><RefreshCw size={16} />刷新设置</PrimaryButton>
              <PrimaryButton
                onClick={() => saveSetting.run(() => appApi.put(`/local/settings/${encodeURIComponent(settingForm.category)}/${encodeURIComponent(settingForm.key)}`, { value: settingForm.value, description: settingForm.description }))}
                loading={saveSetting.loading}
              >
                <Save size={16} />保存设置
              </PrimaryButton>
            </div>
            <ResultSummary
              title="设置摘要"
              items={[
                { label: "当前分类", value: settingForm.category },
                { label: "当前键", value: settingForm.key },
                { label: "设置总数", value: String(settingItems.length) },
              ]}
            />
            <CompactTable title="设置列表" columns={["分类", "键", "值", "更新时间"]} rows={settingRows} />
            <ResultPanel result={saveSetting.result || settings.result} />
          </div>
        </SectionCard>

        <SectionCard title="最近操作日志" icon={<HardDrive size={18} color="#3b82f6" />}>
          <div className="stack-16">
            <div className="grid-2">
              <Field label="日志条数"><input className="input" value={logLimit} onChange={(e) => setLogLimit(e.target.value)} /></Field>
              <Field label="日志说明" hint="本地自动记录代理层请求与返回摘要。"><input className="input" value="自动记录中" disabled /></Field>
            </div>
            <div className="badge-row">
              <PrimaryButton onClick={() => loadLogs()} loading={logs.loading}><RefreshCw size={16} />刷新日志</PrimaryButton>
            </div>
            <CompactTable title="操作日志" columns={["Method", "Path", "HTTP", "结果", "详情"]} rows={logRows} />
            {selectedLog ? (
              <div className="result-summary">
                <div className="result-summary-title">日志详情</div>
                <pre className="json-box">{prettyJson(selectedLog)}</pre>
              </div>
            ) : null}
            <ResultPanel result={logs.result} />
          </div>
        </SectionCard>
      </div>

      <SectionCard title="告警快照详情" icon={<BellRing size={18} color="#ef4444" />}>
        <div className="stack-16">
          <div className="grid-3">
            <Field label="快照条数"><input className="input" value={snapshotLimit} onChange={(e) => setSnapshotLimit(e.target.value)} /></Field>
            <Field label="设备过滤"><input className="input" value={snapshotDeviceId} onChange={(e) => setSnapshotDeviceId(e.target.value)} placeholder="31011500991323310018" /></Field>
            <Field label="当前状态"><input className="input" value={selectedSnapshot?.deviceId || "未选择"} disabled /></Field>
          </div>
          <div className="badge-row">
            <PrimaryButton onClick={() => loadSnapshots()} loading={snapshots.loading}><RefreshCw size={16} />刷新快照</PrimaryButton>
          </div>
          <CompactTable title="告警快照" columns={["Alarm ID", "设备号", "报警", "等级", "详情"]} rows={snapshotRows} />
          {selectedSnapshot ? (
            <div className="split-two">
              <div className="result-summary">
                <div className="result-summary-title">快照摘要</div>
                <pre className="json-box">{prettyJson(selectedSnapshot)}</pre>
              </div>
              <div className="result-summary">
                <div className="result-summary-title">原始 payload</div>
                <pre className="json-box">{prettyJson(selectedSnapshotPayload)}</pre>
              </div>
            </div>
          ) : null}
          <ResultPanel result={snapshots.result} />
        </div>
      </SectionCard>
    </div>
  );
}
