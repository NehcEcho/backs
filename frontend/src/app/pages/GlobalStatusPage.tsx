import { MapPinned, Route, Satellite, TimerReset } from "lucide-react";
import { SectionCard, StatCard, StatusBadge } from "@/app/components/common";

const stats = [
  { label: "轨迹查询入口", value: "已接通", trend: "对应 `/v1/locations`", color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: <Route size={20} color="#10b981" /> },
  { label: "地图渲染模式", value: "高德", trend: "Key 填写后直接显示", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: <MapPinned size={20} color="#3b82f6" /> },
  { label: "定位精度筛选", value: "7 级", trend: "0-6 全部可传", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", icon: <Satellite size={20} color="#8b5cf6" /> },
  { label: "时间轴能力", value: "起止查询", trend: "秒级时间戳", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: <TimerReset size={20} color="#f59e0b" /> },
];

export function GlobalStatusPage() {
  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1 className="page-title">全局态势</h1>
          <div className="page-subtitle">这里作为轨迹与地图联动说明页，实际轨迹查询能力已整合进设备管理页的历史轨迹模块。</div>
        </div>
        <div className="badge-row">
          <StatusBadge label="地图能力已预留" color="#059669" background="rgba(16,185,129,0.1)" />
        </div>
      </div>

      <div className="grid-4">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <SectionCard title="说明" icon={<MapPinned size={18} color="#10b981" />}>
        <div className="stack-16">
          <div className="soft-panel" style={{ padding: 18, lineHeight: 1.8, fontSize: 14, color: "var(--text-soft)" }}>
            `project` 示例中的首页地图风格已完整迁移，并升级为可配置高德 Key 的真实地图能力。为避免重复造多个相似地图页面，实际设备轨迹接口 `/v1/locations` 已在“设备管理”页提供表单与结果展示。
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
