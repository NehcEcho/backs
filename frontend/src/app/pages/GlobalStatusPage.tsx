import { useEffect, useMemo } from "react";
import { Activity, DatabaseZap, MapPinned, Route, Satellite, TimerReset } from "lucide-react";
import { CompactTable, PrimaryButton, ResultPanel, SectionCard, StatCard, StatusBadge } from "@/app/components/common";
import { appApi } from "@/app/lib/api";
import { useRequest } from "@/app/hooks/useRequest";

function unwrapArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.payload)) return value.payload;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

export function GlobalStatusPage() {
  const health = useRequest<any>();
  const settings = useRequest<any>();
  const logs = useRequest<any>();

  useEffect(() => {
    void health.run(() => appApi.get("/health"));
    void settings.run(() => appApi.get("/local/settings?category=map"));
    void logs.run(() => appApi.get("/local/operation-logs?limit=20"));
  }, []);

  const mapSettings = useMemo(() => unwrapArray(settings.result?.data), [settings.result]);
  const operationLogs = useMemo(() => unwrapArray(logs.result?.data), [logs.result]);
  const recentLocationLogs = operationLogs.filter((item) => String(item?.path || "").includes("/v1/locations"));

  const stats = [
    { label: "服务健康状态", value: health.result?.ok ? "UP" : "待检查", trend: "对应 /api/health", color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: <Activity size={20} color="#10b981" /> },
    { label: "地图设置项", value: String(mapSettings.length), trend: "来自本地 SQLite 设置", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: <DatabaseZap size={20} color="#3b82f6" /> },
    { label: "轨迹调用记录", value: String(recentLocationLogs.length), trend: "最近 /v1/locations 请求次数", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", icon: <Route size={20} color="#8b5cf6" /> },
    { label: "时间轴能力", value: "起止查询", trend: "前端已切到 picker 输入", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: <TimerReset size={20} color="#f59e0b" /> },
  ];

  const settingRows = useMemo(
    () => mapSettings.map((item) => [String(item.key || item.settingKey || "-"), String(item.value || item.settingValue || "-"), String(item.description || "-")]),
    [mapSettings],
  );

  const locationRows = useMemo(
    () => recentLocationLogs.slice(0, 8).map((item) => [String(item.method || "-"), String(item.statusCode ?? "-"), String(item.message || "-"), String(item.createdAt || "-")]),
    [recentLocationLogs],
  );

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1 className="page-title">全局态势</h1>
          <div className="page-subtitle">这里改成真实状态页，显示服务健康、本地地图设置和最近轨迹调用，而不是单纯说明文案。</div>
        </div>
        <div className="badge-row">
          <StatusBadge label={health.result?.ok ? "实时状态已接通" : "等待状态数据"} color={health.result?.ok ? "#059669" : "#d97706"} background={health.result?.ok ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)"} />
        </div>
      </div>

      <div className="grid-4">
        {stats.map((item) => <StatCard key={item.label} {...item} />)}
      </div>

      <div className="split-two">
        <SectionCard title="地图与轨迹状态" icon={<MapPinned size={18} color="#10b981" />}>
          <div className="stack-16">
            <div className="badge-row">
              <PrimaryButton onClick={() => health.run(() => appApi.get("/health"))}>刷新健康状态</PrimaryButton>
              <PrimaryButton onClick={() => settings.run(() => appApi.get("/local/settings?category=map"))}>刷新地图设置</PrimaryButton>
              <PrimaryButton onClick={() => logs.run(() => appApi.get("/local/operation-logs?limit=20"))}>刷新调用记录</PrimaryButton>
            </div>
            <div className="soft-panel" style={{ padding: 18, lineHeight: 1.8, fontSize: 14, color: "var(--text-soft)" }}>
              首页地图继续承载真实设备 / 围栏 / 报警渲染；这个页面补的是系统级态势信息：服务是否正常、本地默认地图参数是什么、最近有没有真正打过轨迹接口。
            </div>
            <CompactTable title="地图设置" columns={["键", "值", "描述"]} rows={settingRows} />
          </div>
        </SectionCard>

        <SectionCard title="最近轨迹调用" icon={<Satellite size={18} color="#3b82f6" />}>
          <div className="stack-16">
            <CompactTable title="/v1/locations 调用记录" columns={["Method", "HTTP", "消息", "时间"]} rows={locationRows} />
          </div>
        </SectionCard>
      </div>

      <div className="split-two">
        <SectionCard title="服务健康原始结果" icon={<Activity size={18} color="#10b981" />}>
          <ResultPanel result={health.result} />
        </SectionCard>
        <SectionCard title="本地调用原始结果" icon={<DatabaseZap size={18} color="#8b5cf6" />}>
          <ResultPanel result={logs.result || settings.result} />
        </SectionCard>
      </div>
    </div>
  );
}
