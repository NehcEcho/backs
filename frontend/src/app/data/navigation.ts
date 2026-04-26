import {
  Activity,
  BarChart3,
  BellRing,
  Cpu,
  Database,
  HardHat,
  LayoutDashboard,
  Map,
  Radio,
  ShieldAlert,
  UserRound,
  Video,
  Waves,
  type LucideIcon,
} from "lucide-react";

export interface MenuItem {
  label: string;
  path: string;
  group: string;
  icon: LucideIcon;
}

export const menuGroups: Array<{ group: string; items: MenuItem[] }> = [
  {
    group: "工作台",
    items: [
      { label: "首页门户", path: "/home-portal", group: "工作台", icon: LayoutDashboard },
      { label: "全局态势", path: "/global-status", group: "工作台", icon: Map },
    ],
  },
  {
    group: "平台联调",
    items: [
      { label: "认证用户", path: "/auth-user", group: "平台联调", icon: UserRound },
      { label: "设备管理", path: "/devices", group: "平台联调", icon: Cpu },
      { label: "围栏报警", path: "/fences-alarms", group: "平台联调", icon: ShieldAlert },
      { label: "对讲分组", path: "/talk-groups", group: "平台联调", icon: Radio },
      { label: "国标视频", path: "/gb-video", group: "平台联调", icon: Video },
      { label: "私有 RTC", path: "/rtc-files", group: "平台联调", icon: Waves },
      { label: "LiveKit", path: "/livekit", group: "平台联调", icon: Activity },
      { label: "本地工位", path: "/local-workbench", group: "平台联调", icon: Database },
      { label: "接口总览", path: "/analysis-result", group: "平台联调", icon: BarChart3 },
      { label: "调试记录", path: "/safety-alert", group: "平台联调", icon: BellRing },
    ],
  },
];

export const quickLinks = [
  { label: "设备管理", path: "/devices", icon: Cpu, color: "#ec4899" },
  { label: "围栏报警", path: "/fences-alarms", icon: ShieldAlert, color: "#f59e0b" },
  { label: "国标视频", path: "/gb-video", icon: Video, color: "#3b82f6" },
  { label: "私有 RTC", path: "/rtc-files", icon: Waves, color: "#8b5cf6" },
  { label: "LiveKit", path: "/livekit", icon: Activity, color: "#10b981" },
  { label: "认证用户", path: "/auth-user", icon: HardHat, color: "#10b981" },
];

export const defaultOpenTabs = [
  "/home-portal",
  "/global-status",
  "/devices",
  "/fences-alarms",
  "/gb-video",
];
