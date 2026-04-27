import {
  AudioLines,
  BellRing,
  Camera,
  Cpu,
  HardHat,
  LayoutDashboard,
  Mic,
  Monitor,
  Radio,
  ShieldAlert,
  UserCircle2,
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
    items: [{ label: "首页门户", path: "/home-portal", group: "工作台", icon: LayoutDashboard }],
  },
  {
    group: "安全与联动",
    items: [
      { label: "全局态势", path: "/global-status", group: "安全与联动", icon: Monitor },
      { label: "安全告警", path: "/fences-alarms", group: "安全与联动", icon: ShieldAlert },
      { label: "设备管理", path: "/devices", group: "安全与联动", icon: Cpu },
      { label: "现场视频", path: "/gb-video", group: "安全与联动", icon: Camera },
      { label: "处置记录", path: "/safety-alert", group: "安全与联动", icon: BellRing },
      { label: "对讲分组", path: "/talk-groups", group: "安全与联动", icon: Mic },
      { label: "RTC 文件", path: "/rtc-files", group: "安全与联动", icon: AudioLines },
      { label: "LiveKit", path: "/livekit", group: "安全与联动", icon: Radio },
      { label: "账号中心", path: "/account", group: "安全与联动", icon: UserCircle2 },
    ],
  },
];

export const quickLinks = [
  { label: "全局态势", path: "/global-status", icon: Monitor, color: "#3b82f6" },
  { label: "设备管理", path: "/devices", icon: Cpu, color: "#10b981" },
  { label: "安全告警", path: "/fences-alarms", icon: ShieldAlert, color: "#f59e0b" },
  { label: "现场视频", path: "/gb-video", icon: Camera, color: "#8b5cf6" },
  { label: "处置记录", path: "/safety-alert", icon: BellRing, color: "#ef4444" },
  { label: "对讲分组", path: "/talk-groups", icon: Mic, color: "#0f766e" },
  { label: "账号中心", path: "/account", icon: UserCircle2, color: "#2563eb" },
  { label: "首页门户", path: "/home-portal", icon: HardHat, color: "#10b981" },
];

export const defaultOpenTabs = ["/home-portal", "/global-status", "/devices", "/fences-alarms", "/gb-video", "/talk-groups", "/account"];
