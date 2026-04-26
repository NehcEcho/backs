import { useEffect, useMemo } from "react";
import { BarChart3, CheckCircle2, ClipboardList, DatabaseZap, Network, ShieldCheck } from "lucide-react";
import { CompactTable, PrimaryButton, ResultPanel, SectionCard, StatCard, StatusBadge } from "@/app/components/common";
import { appApi } from "@/app/lib/api";
import { useRequest } from "@/app/hooks/useRequest";

function unwrapArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.payload)) return value.payload;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

export function AnalysisPage() {
  const settings = useRequest<any>();
  const logs = useRequest<any>();
  const alarms = useRequest<any>();

  useEffect(() => {
    void settings.run(() => appApi.get("/local/settings"));
    void logs.run(() => appApi.get("/local/operation-logs?limit=50"));
    void alarms.run(() => appApi.get("/local/alarm-snapshots?limit=50"));
  }, []);

  const settingItems = useMemo(() => unwrapArray(settings.result?.data), [settings.result]);
  const logItems = useMemo(() => unwrapArray(logs.result?.data), [logs.result]);
  const alarmItems = useMemo(() => unwrapArray(alarms.result?.data), [alarms.result]);
  const failedCount = logItems.filter((item) => item?.success === false).length;
  const settingRows = useMemo(
    () => settingItems.map((item) => [String(item.category || "-"), String(item.key || item.settingKey || "-"), String(item.value || item.settingValue || "-"), String(item.updatedAt || "-")]),
    [settingItems],
  );

  const cards = [
    { label: "本地设置项", value: String(settingItems.length), trend: "来自 /api/local/settings", color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: <DatabaseZap size={20} color="#10b981" /> },
    { label: "最近联调调用", value: String(logItems.length), trend: failedCount ? `${failedCount} 次失败待排查` : "最近调用稳定", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: <Network size={20} color="#3b82f6" /> },
    { label: "告警快照", value: String(alarmItems.length), trend: "来自本地同步表", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: <ShieldCheck size={20} color="#f59e0b" /> },
    { label: "真实分析页", value: "已启用", trend: "不再只是静态说明", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", icon: <BarChart3 size={20} color="#8b5cf6" /> },
  ];

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1 className="page-title">接口总览</h1>
          <div className="page-subtitle">这里现在直接读取本地设置、操作日志和告警快照，帮助你看当前联调面是否真的跑起来。</div>
        </div>
        <div className="badge-row">
          <StatusBadge label="本地分析面板已接通" color="#059669" background="rgba(16,185,129,0.1)" />
        </div>
      </div>

      <div className="grid-4">
        {cards.map((card) => <StatCard key={card.label} {...card} />)}
      </div>

      <div className="split-two">
        <SectionCard title="本地配置与能力面" icon={<ClipboardList size={18} color="#10b981" />}>
          <div className="stack-16">
            <div className="badge-row">
              <PrimaryButton onClick={() => settings.run(() => appApi.get("/local/settings"))}>刷新设置</PrimaryButton>
              <PrimaryButton onClick={() => logs.run(() => appApi.get("/local/operation-logs?limit=50"))}>刷新日志</PrimaryButton>
              <PrimaryButton onClick={() => alarms.run(() => appApi.get("/local/alarm-snapshots?limit=50"))}>刷新告警快照</PrimaryButton>
            </div>
            <div className="soft-panel" style={{ padding: 18 }}>
              <div style={{ fontWeight: 600, marginBottom: 10 }}>已接通的真实数据面</div>
              <div className="stack-12" style={{ fontSize: 14, color: "var(--text-soft)" }}>
                {[
                  `本地设置 ${settingItems.length} 项`,
                  `操作日志 ${logItems.length} 条`,
                  `报警快照 ${alarmItems.length} 条`,
                  "首页地图继续使用真实设备 / 围栏 / 报警接口",
                ].map((text) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={15} color="#10b981" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResultPanel result={settings.result} />
          </div>
        </SectionCard>

        <SectionCard title="本地设置表" icon={<DatabaseZap size={18} color="#3b82f6" />}>
          <div className="stack-16">
            <CompactTable title="应用设置" columns={["分类", "键", "值", "更新时间"]} rows={settingRows} />
          </div>
        </SectionCard>
      </div>

      <div className="split-two">
        <SectionCard title="操作日志原始结果" icon={<Network size={18} color="#f59e0b" />}>
          <ResultPanel result={logs.result} />
        </SectionCard>
        <SectionCard title="报警快照原始结果" icon={<ShieldCheck size={18} color="#ef4444" />}>
          <ResultPanel result={alarms.result} />
        </SectionCard>
      </div>
    </div>
  );
}
