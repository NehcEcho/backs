import { BellRing, Clock3, ListChecks } from "lucide-react";
import { SectionCard, StatusBadge } from "@/app/components/common";

const logs = [
  ["2026-04-26 13:02:10", "后端设备测试", "Maven 测试全部通过"],
  ["2026-04-26 13:03:48", "项目结构", "发现 `project` 为示例 Figma 前端，不是可运行成品"],
  ["2026-04-26 13:08:20", "文档比对", "设备接口文档与现有后端端点已对齐"],
  ["2026-04-26 13:12:00", "前端搭建", "开始构建真实可运行的联调前端"],
];

export function SafetyAlertPage() {
  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1 className="page-title">调试记录</h1>
          <div className="page-subtitle">用示例页风格展示当前联调轨迹、检查结果和重要注意事项。</div>
        </div>
        <div className="badge-row">
          <StatusBadge label="持续更新中" color="#d97706" background="rgba(245,158,11,0.1)" />
        </div>
      </div>

      <SectionCard title="执行日志" icon={<BellRing size={18} color="#ef4444" />}>
        <div className="stack-12">
          {logs.map(([time, title, desc]) => (
            <div key={time} className="soft-panel" style={{ padding: 16, display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 38, height: 38, borderRadius: 14, display: "grid", placeItems: "center", background: "rgba(239,68,68,0.08)" }}>
                <Clock3 size={16} color="#ef4444" />
              </div>
              <div className="stack-12" style={{ gap: 6 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span>
                  <span className="mini-meta">{time}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-soft)" }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="接下来重点" icon={<ListChecks size={18} color="#10b981" />}>
        <div className="soft-panel" style={{ padding: 18, fontSize: 14, lineHeight: 1.8, color: "var(--text-soft)" }}>
          目前重点是把每个控制器对应的表单、查询和结果板全部做齐，并在构建后继续根据 TypeScript 和运行结果修正细节。后端接口本身没有明显“缺设备接口”的大缺口，更多是契约体验和校验层面的增强空间。
        </div>
      </SectionCard>
    </div>
  );
}
