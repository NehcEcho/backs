import { useMemo, useState, type MouseEvent } from "react";
import { Bell, ChevronDown, ChevronRight, HardHat, LogOut, Monitor, X } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { defaultOpenTabs, menuGroups } from "@/app/data/navigation";
import { useAuth } from "@/app/context/AuthContext";

const onlinePanels = [
  { id: 1, name: "设备在线", location: "接口联调中" },
  { id: 2, name: "视频链路", location: "等待串流" },
  { id: 3, name: "围栏引擎", location: "规则生效中" },
  { id: 4, name: "对讲服务", location: "空闲待命" },
];

function findItem(pathname: string) {
  for (const group of menuGroups) {
    for (const item of group.items) {
      if (item.path === pathname) return item;
    }
  }
  return menuGroups[0].items[0];
}

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, logout } = useAuth();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ 工作台: true, 平台联调: true });
  const [personnelOpen, setPersonnelOpen] = useState(true);
  const [activeTabs, setActiveTabs] = useState(defaultOpenTabs);

  const currentPath = location.pathname === "/" ? "/home-portal" : location.pathname;
  const currentItem = useMemo(() => findItem(currentPath), [currentPath]);

  const breadcrumb = useMemo(() => [currentItem.group, currentItem.label], [currentItem]);

  const openRoute = (path: string) => {
    navigate(path);
    setActiveTabs((prev) => (prev.includes(path) ? prev : [...prev, path]));
  };

  const closeTab = (path: string, event: MouseEvent) => {
    event.stopPropagation();
    const next = activeTabs.filter((item) => item !== path);
    setActiveTabs(next);
    if (currentPath === path) {
      navigate(next[next.length - 1] || "/home-portal");
    }
  };

  return (
    <div className="shell">
      <aside
        style={{ width: 240, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.4)", backdropFilter: "blur(20px)", borderRight: "1px solid var(--line)" }}
      >
        <div style={{ padding: 20, borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 4 }}>
            <div style={{ width: 40, height: 40, borderRadius: 16, display: "grid", placeItems: "center", background: "linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9))", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)" }}>
              <HardHat size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>工矿帽联调台</div>
              <div style={{ fontSize: 11, color: "var(--text-soft)", lineHeight: 1.4 }}>深度参考 Figma 示例的运营控制台</div>
            </div>
          </div>
        </div>

        <div style={{ padding: 16, paddingBottom: 12 }}>
          <button className="button button-primary" style={{ width: "100%" }} onClick={() => openRoute("/home-portal")}>
            <Monitor size={16} />
            进入指挥中心
          </button>
        </div>

        <div style={{ padding: "0 16px 12px" }}>
          <button className="button button-secondary" style={{ width: "100%", justifyContent: "space-between" }} onClick={() => setPersonnelOpen((value) => !value)}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-soft)", letterSpacing: 0.3 }}>联调组件</span>
            {personnelOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          {personnelOpen ? (
            <div className="stack-12" style={{ marginTop: 10 }}>
              {onlinePanels.map((item) => (
                <div key={item.id} className="soft-panel hover-lift" style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ position: "relative", width: 8, height: 8, borderRadius: 99, background: "#10b981", boxShadow: "0 0 0 6px rgba(16,185,129,0.08)" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{item.name}</span>
                    <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{item.location}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div style={{ margin: "0 16px 12px", borderTop: "1px solid var(--line)" }} />

        <nav style={{ flex: 1, overflow: "auto", padding: "0 12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {menuGroups.map((group) => (
            <div key={group.group}>
              <button className="button button-secondary" style={{ width: "100%", justifyContent: "space-between", padding: "8px 10px" }} onClick={() => setOpenGroups((prev) => ({ ...prev, [group.group]: !prev[group.group] }))}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-soft)", letterSpacing: 0.3 }}>{group.group}</span>
                {openGroups[group.group] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              {openGroups[group.group] ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
                  {group.items.map((item) => {
                    const active = currentPath === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => openRoute(item.path)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          textAlign: "left",
                          padding: "10px 12px",
                          borderRadius: 12,
                          border: active ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid transparent",
                          background: active ? "rgba(16, 185, 129, 0.12)" : "transparent",
                          color: active ? "#059669" : "#6b7280",
                          fontSize: 13,
                          fontWeight: active ? 500 : 400,
                        }}
                      >
                        <item.icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div style={{ padding: 16, borderTop: "1px solid var(--line)" }}>
          <div style={{ fontSize: 11, color: "var(--text-faint)" }}>v1.0.0 · 智能工矿帽接口联调平台</div>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ height: 64, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 24px", background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <span style={{ color: "var(--text-faint)" }}>首页</span>
            <span style={{ color: "#d1d5db" }}>/</span>
            {breadcrumb.map((item, index) => (
              <span key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: index === breadcrumb.length - 1 ? "var(--text)" : "var(--text-faint)", fontWeight: index === breadcrumb.length - 1 ? 600 : 400 }}>{item}</span>
                {index < breadcrumb.length - 1 ? <span style={{ color: "#d1d5db" }}>/</span> : null}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="button button-secondary" style={{ padding: 10, position: "relative" }}>
              <Bell size={18} />
              <span style={{ position: "absolute", right: 8, top: 8, width: 8, height: 8, borderRadius: 999, background: "#ef4444" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 999, display: "grid", placeItems: "center", color: "#fff", fontSize: 14, fontWeight: 600, background: "linear-gradient(135deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9))" }}>{username.slice(0, 1)}</div>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{username}</span>
            </div>
            <button className="button button-secondary" onClick={() => { logout(); navigate("/login"); }}>
              <LogOut size={14} />
              退出登录
            </button>
          </div>
        </header>

        <div style={{ height: 48, display: "flex", alignItems: "center", padding: "0 20px", gap: 0, background: "rgba(255,255,255,0.3)", borderBottom: "1px solid var(--line)", backdropFilter: "blur(8px)" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, overflowX: "auto" }}>
            {activeTabs.map((tabPath) => {
              const item = findItem(tabPath);
              const active = currentPath === tabPath;
              return (
                <button key={tabPath} onClick={() => openRoute(tabPath)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 12, border: `1px solid ${active ? "rgba(16, 185, 129, 0.2)" : "rgba(0,0,0,0.06)"}`, background: active ? "rgba(16, 185, 129, 0.1)" : "rgba(255,255,255,0.5)", color: active ? "#059669" : "#6b7280", fontSize: 13 }}>
                  {active ? <span className="tiny-dot" style={{ background: "#10b981" }} /> : null}
                  {item.label}
                  <span onClick={(event) => closeTab(tabPath, event)} style={{ opacity: 0.75, display: "grid", placeItems: "center" }}>
                    <X size={12} />
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 16 }}>
            <button className="button button-secondary" style={{ padding: "8px 12px", fontSize: 12 }} onClick={() => setActiveTabs([currentPath])}>关闭其他</button>
            <button className="button button-secondary" style={{ padding: "8px 12px", fontSize: 12 }} onClick={() => setActiveTabs([])}>全部关闭</button>
          </div>
        </div>

        <main style={{ flex: 1, overflow: "auto", padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
