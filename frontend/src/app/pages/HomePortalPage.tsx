import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Activity, AlertTriangle, MapPin, Radio, Shield, TrendingUp, Users, Video } from "lucide-react";
import { SectionCard, StatCard, StatusBadge } from "@/app/components/common";
import { quickLinks } from "@/app/data/navigation";
import { useAmap } from "@/app/hooks/useAmap";
import { api } from "@/app/lib/api";

type DeviceItem = {
  id?: number;
  deviceId?: string;
  deviceName?: string;
  longitude?: string;
  latitude?: string;
  status?: string;
};

type FenceItem = {
  id?: number;
  fenceName?: string;
  eventType?: number;
  fenceShape?: string;
  circleFenceData?: { radius?: number; center?: { longitude?: string; latitude?: string } };
  polygonFenceData?: Array<{ longitude?: string; latitude?: string }>;
};

type AlarmItem = {
  id?: number;
  deviceId?: string;
  deviceName?: string;
  alarmName?: string;
  alarmTime?: number;
  level?: string;
  eventCode?: string;
  status?: string;
};

function toNum(value?: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function unwrapList(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.groups)) return payload.groups.flatMap((group: any) => group?.devices || []);
  if (Array.isArray(payload?.data?.groups)) return payload.data.groups.flatMap((group: any) => group?.devices || []);
  return [];
}

function getAlarmColor(level?: string) {
  const text = (level || "").toLowerCase();
  if (text.includes("high") || text.includes("高") || text.includes("urgent")) return "#ef4444";
  if (text.includes("medium") || text.includes("中") || text.includes("关注") || text.includes("warn")) return "#f59e0b";
  return "#10b981";
}

function formatAlarmTime(value?: number) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

export function HomePortalPage() {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const overlayRef = useRef<any[]>([]);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [fences, setFences] = useState<FenceItem[]>([]);
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const { ready, error } = useAmap();

  const alarmMap = useMemo(() => {
    const map = new Map<string, AlarmItem>();
    alarms.forEach((alarm) => {
      if (!alarm.deviceId) return;
      const current = map.get(alarm.deviceId);
      if (!current || (alarm.alarmTime || 0) > (current.alarmTime || 0)) map.set(alarm.deviceId, alarm);
    });
    return map;
  }, [alarms]);

  const onlineCount = devices.filter((item) => (item.status || "").toLowerCase() === "online").length;
  const positionedDevices = devices.filter((item) => toNum(item.longitude) !== null && toNum(item.latitude) !== null);
  const overviewStats = [
    { label: "设备总数", value: String(devices.length || 0), trend: `${positionedDevices.length} 台具备坐标`, color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: <Shield color="#10b981" size={20} /> },
    { label: "在线设备", value: String(onlineCount), trend: "根据设备状态实时统计", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: <Activity color="#3b82f6" size={20} /> },
    { label: "围栏数量", value: String(fences.length || 0), trend: "Circle / Polygon 自动绘制", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: <Video color="#f59e0b" size={20} /> },
    { label: "近期报警", value: String(alarms.length || 0), trend: "地图会高亮异常设备", color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: <TrendingUp color="#ef4444" size={20} /> },
  ];

  const recentAlerts = useMemo(() => alarms.slice(0, 6), [alarms]);
  const criticalAlertCount = alarms.filter((item) => {
    const text = (item.level || "").toLowerCase();
    return text.includes("high") || text.includes("高") || text.includes("urgent");
  }).length;
  const latestAlert = recentAlerts[0];

  useEffect(() => {
    let disposed = false;
    async function load() {
      setLoadingData(true);
      setDataError(null);
      const [deviceResult, fenceResult, alarmResult] = await Promise.all([
        api.get<any>("/v1/devices?is_page=true&page_index=1&page_size=200"),
        api.get<any>("/v1/fences?is_page=true&page_index=1&page_size=200"),
        api.get<any>("/v1/alarms?is_page=true&page_index=1&page_size=20"),
      ]);
      if (disposed) return;
      setDevices(unwrapList(deviceResult.data?.payload) as DeviceItem[]);
      setFences(unwrapList(fenceResult.data?.payload) as FenceItem[]);
      setAlarms(unwrapList(alarmResult.data?.payload) as AlarmItem[]);
      if (!deviceResult.ok && !fenceResult.ok && !alarmResult.ok) {
        setDataError(deviceResult.error || fenceResult.error || alarmResult.error || "地图业务数据加载失败");
      }
      setLoadingData(false);
    }
    load();
    return () => { disposed = true; };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.AMap) return;
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.AMap.Map(mapRef.current, { zoom: 13, center: [116.397428, 39.90923], showLabel: true, viewMode: "2D" });
      window.AMap.plugin(["AMap.Scale", "AMap.ToolBar", "AMap.ControlBar"], () => {
        const map = mapInstanceRef.current;
        if (!map) return;
        map.addControl(new window.AMap.Scale());
        map.addControl(new window.AMap.ToolBar({ position: { right: "18px", top: "18px" } }));
        map.addControl(new window.AMap.ControlBar({ position: { right: "18px", top: "110px" } }));
      });
    }

    const map = mapInstanceRef.current;
    overlayRef.current.forEach((item) => map.remove(item));
    overlayRef.current = [];
    const nextOverlays: any[] = [];
    const bounds: any[] = [];

    positionedDevices.forEach((item) => {
      const lng = toNum(item.longitude)!;
      const lat = toNum(item.latitude)!;
      const alarm = item.deviceId ? alarmMap.get(item.deviceId) : undefined;
      const online = (item.status || "").toLowerCase() === "online";
      const color = alarm ? getAlarmColor(alarm.level) : online ? "#10b981" : "#94a3b8";
      const marker = new window.AMap.CircleMarker({ center: [lng, lat], radius: alarm ? 10 : 8, strokeColor: "#ffffff", strokeWeight: 2, fillColor: color, fillOpacity: 0.95 });
      const infoWindow = new window.AMap.InfoWindow({ content: `<div style="padding:12px;min-width:220px;line-height:1.7;"><div style="font-size:14px;font-weight:600;color:#2d2d2d;margin-bottom:6px;">${item.deviceName || item.deviceId || "未命名设备"}</div><div style="font-size:12px;color:#6b7280;">设备 ID：${item.deviceId || "-"}</div><div style="font-size:12px;color:#6b7280;">状态：${item.status || "未知"}</div><div style="font-size:12px;color:${alarm ? color : "#6b7280"};margin-top:6px;">${alarm ? `最新报警：${alarm.alarmName || alarm.eventCode || "异常"}` : "当前无报警"}</div></div>` });
      marker.on("click", () => infoWindow.open(map, [lng, lat]));
      marker.setMap(map);
      nextOverlays.push(marker);
      bounds.push([lng, lat]);
    });

    fences.forEach((fence) => {
      const shape = (fence.fenceShape || "").toLowerCase();
      if (shape === "circle") {
        const centerLng = toNum(fence.circleFenceData?.center?.longitude);
        const centerLat = toNum(fence.circleFenceData?.center?.latitude);
        if (centerLng !== null && centerLat !== null) {
          const circle = new window.AMap.Circle({ center: [centerLng, centerLat], radius: Number(fence.circleFenceData?.radius || 0), strokeColor: fence.eventType === 12 ? "#ef4444" : "#f59e0b", strokeWeight: 2, fillOpacity: 0.08, fillColor: fence.eventType === 12 ? "#ef4444" : "#f59e0b" });
          circle.setMap(map);
          nextOverlays.push(circle);
          bounds.push([centerLng, centerLat]);
        }
      }
      if (shape === "polygon" && Array.isArray(fence.polygonFenceData)) {
        const path = fence.polygonFenceData.map((point) => {
          const lng = toNum(point.longitude);
          const lat = toNum(point.latitude);
          return lng !== null && lat !== null ? [lng, lat] : null;
        }).filter(Boolean);
        if (path.length > 2) {
          const polygon = new window.AMap.Polygon({ path, strokeColor: fence.eventType === 12 ? "#ef4444" : "#f59e0b", strokeWeight: 2, fillOpacity: 0.08, fillColor: fence.eventType === 12 ? "#ef4444" : "#f59e0b" });
          polygon.setMap(map);
          nextOverlays.push(polygon);
          bounds.push(...path);
        }
      }
    });

    overlayRef.current = nextOverlays;
    if (bounds.length > 0) map.setFitView(nextOverlays, false, [60, 60, 60, 60]);
    return () => {
      overlayRef.current.forEach((item) => map.remove(item));
      overlayRef.current = [];
    };
  }, [ready, positionedDevices, fences, alarmMap]);

  useEffect(() => () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.destroy();
      mapInstanceRef.current = null;
    }
  }, []);

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1 className="page-title">首页门户</h1>
          <div className="page-subtitle">智能矿山安全管理平台 - 实时态势监控</div>
        </div>
        <div className="badge-row">
          <StatusBadge label={loadingData ? "数据加载中" : "系统运行中"} color={loadingData ? "#d97706" : "#059669"} background={loadingData ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)"} />
        </div>
      </div>

      <section className="portal-hero panel">
        <div className="portal-hero-main">
          <div className="portal-hero-kicker">矿区总览</div>
          <div className="portal-hero-title">把设备、围栏和报警放到同一张作战画布里。</div>
          <div className="portal-hero-copy">首页聚合真实坐标、围栏范围和最新报警，值守人员进入系统后可以先看态势，再进入设备、告警或视频处置。</div>
          <div className="portal-hero-actions">
            <button className="portal-hero-button portal-hero-button-primary" onClick={() => navigate("/fences-alarms")}>进入告警处置</button>
            <button className="portal-hero-button portal-hero-button-secondary" onClick={() => navigate("/devices")}>查看设备台账</button>
          </div>
        </div>
        <div className="portal-hero-side">
          <div className="portal-signal-card">
            <div className="portal-signal-label">高优先级报警</div>
            <div className="portal-signal-value">{criticalAlertCount}</div>
            <div className="portal-signal-meta">{latestAlert ? `最近更新 ${formatAlarmTime(latestAlert.alarmTime)}` : "当前暂无高优先级记录"}</div>
          </div>
          <div className="portal-mini-metrics">
            <div className="portal-mini-metric">
              <span>在线率</span>
              <strong>{devices.length ? `${Math.round((onlineCount / devices.length) * 100)}%` : "0%"}</strong>
            </div>
            <div className="portal-mini-metric">
              <span>围栏覆盖</span>
              <strong>{fences.length} 组</strong>
            </div>
          </div>
        </div>
      </section>

      <div className="grid-4">{overviewStats.map((item) => <StatCard key={item.label} {...item} />)}</div>

      <div className="grid-3">
        <section className="panel" style={{ gridColumn: "span 2", overflow: "hidden", minHeight: 500 }}>
          <div className="section-header">
            <div>
              <div className="section-title"><MapPin size={18} color="#10b981" /><span>矿区实时态势地图</span></div>
              <div className="map-header-subtitle">按设备在线状态、报警等级和围栏范围叠加展示当前矿区现场态势。</div>
            </div>
            <div className="badge-row">
              <div className="legend-dot"><span className="tiny-dot" style={{ background: "#10b981" }} />正常</div>
              <div className="legend-dot"><span className="tiny-dot" style={{ background: "#f59e0b" }} />预警</div>
              <div className="legend-dot"><span className="tiny-dot" style={{ background: "#ef4444" }} />危险</div>
            </div>
          </div>
          <div style={{ height: 435 }}>
            <div ref={mapRef} className="map-canvas">
              <div className="map-top-strip">
                <div className="map-top-chip"><span className="map-top-chip-label">坐标设备</span><strong>{positionedDevices.length}</strong></div>
                <div className="map-top-chip"><span className="map-top-chip-label">围栏覆盖</span><strong>{fences.length}</strong></div>
                <div className="map-top-chip"><span className="map-top-chip-label">最新报警</span><strong>{alarms.length}</strong></div>
              </div>
              {!ready ? (
                <div className="empty-hint"><MapPin size={42} color="#10b981" /><div>{error || "正在加载地图脚本..."}</div><div className="mini-meta">填入 `VITE_AMAP_API_KEY` 后刷新即可直接使用。</div></div>
              ) : null}
              {ready && (loadingData || dataError || positionedDevices.length === 0) ? (
                <div className="soft-panel map-hint-float">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><MapPin size={16} color="#10b981" /><span style={{ fontSize: 13, fontWeight: 600 }}>地图已加载</span></div>
                  <div style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.7 }}>{loadingData ? "正在加载真实设备与围栏数据..." : dataError || "当前接口暂未返回有效坐标数据，底图和缩放控件已可正常使用。"}</div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <SectionCard title="实时告警" icon={<Radio size={18} color="#ef4444" />}>
          <div className="stack-12">
            {recentAlerts.length === 0 ? (
              <div className="empty-hint" style={{ minHeight: 240 }}><AlertTriangle size={42} color="#f59e0b" /><div>当前没有拉取到报警记录</div></div>
            ) : recentAlerts.map((alert) => {
              const color = getAlarmColor(alert.level);
              return (
                <div key={alert.id || `${alert.deviceId}-${alert.alarmTime}`} className="soft-panel hover-lift" style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div className="alert-avatar">{(alert.deviceName || alert.deviceId || "设")[0]}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{alert.deviceName || alert.deviceId || "未知设备"}</div>
                        <div className="mini-meta">{alert.alarmName || alert.eventCode || "报警记录"}</div>
                      </div>
                    </div>
                    <StatusBadge label={alert.level || "未知"} color={color} background={`${color}1A`} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-soft)" }}><AlertTriangle size={12} color={color} />{alert.status || "未处理"}</div>
                    <div className="mini-meta">{formatAlarmTime(alert.alarmTime)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="快捷功能" icon={<Users size={18} color="#10b981" />}>
        <div className="quick-grid">
          {quickLinks.map((item) => (
            <button key={item.label} className="soft-panel hover-lift quick-link-card" onClick={() => navigate(item.path)}>
              <div className="quick-link-icon" style={{ background: `${item.color}16` }}><item.icon size={20} color={item.color} /></div>
              <span className="quick-link-label">{item.label}</span>
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
