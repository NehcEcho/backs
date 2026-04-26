import { BarChart3, CheckCircle2, ClipboardList, Network, ScanSearch, ShieldCheck } from "lucide-react";
import { SectionCard, StatCard, StatusBadge } from "@/app/components/common";

const cards = [
  { label: "后端控制器", value: "7", trend: "全部已有前端操作入口", color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: <Network size={20} color="#10b981" /> },
  { label: "设备能力覆盖", value: "完整", trend: "列表 / 文件 / 轨迹 / RTC", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: <ScanSearch size={20} color="#3b82f6" /> },
  { label: "补齐后端缺口", value: "待优化", trend: "更适合做契约增强而非缺接口", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: <ShieldCheck size={20} color="#f59e0b" /> },
  { label: "联调视图", value: "9 页", trend: "按模块拆开，便于直接测试", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", icon: <BarChart3 size={20} color="#8b5cf6" /> },
];

export function AnalysisPage() {
  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1 className="page-title">接口总览</h1>
          <div className="page-subtitle">这里汇总文档覆盖情况、已接入模块和当前后端实现特征，方便你确认是否实现了全部设备能力。</div>
        </div>
        <div className="badge-row">
          <StatusBadge label="设备接口已覆盖" color="#059669" background="rgba(16,185,129,0.1)" />
        </div>
      </div>

      <div className="grid-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <SectionCard title="覆盖清单" icon={<ClipboardList size={18} color="#10b981" />}>
        <div className="grid-2">
          <div className="soft-panel" style={{ padding: 18 }}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>已实现的设备相关后端能力</div>
            <div className="stack-12" style={{ fontSize: 14, color: "var(--text-soft)" }}>
              {["获取用户设备分组", "设备详情与列表筛选", "设备信息更新", "设备文件查询与删除", "历史轨迹定位数据", "GB28181 视频接口", "私有 RTC / 平台文件 / 设备文件 / 下载", "LiveKit token"].map((text) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 size={15} color="#10b981" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="soft-panel" style={{ padding: 18 }}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>当前后端值得继续优化的点</div>
            <div className="stack-12" style={{ fontSize: 14, color: "var(--text-soft)" }}>
              {["统一增加 DTO 校验，减少 JsonNode 裸传", "可兼容 Authorization 头，降低前端接入成本", "下载接口可考虑支持 inline 预览", "WebSocket 语音喊话可补更多状态说明"].map((text) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="tiny-dot" style={{ background: "#f59e0b" }} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
