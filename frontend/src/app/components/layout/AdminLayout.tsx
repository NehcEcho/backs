import { useState, type MouseEvent } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Bell, ChevronDown, ChevronRight, HardHat, LogOut, Monitor, X } from "lucide-react";
import { defaultOpenTabs, menuGroups } from "@/app/data/navigation";
import { useAuth } from "@/app/context/AuthContext";

const onlinePersonnel = [
  { id: 1, name: "值守一班", location: "东翼采区" },
  { id: 2, name: "值守二班", location: "运输大巷" },
  { id: 3, name: "安监岗", location: "综采工作面" },
  { id: 4, name: "调度岗", location: "主井区域" },
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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ 工作台: true, 安全与联动: true });
  const [personnelOpen, setPersonnelOpen] = useState(true);
  const [activeTabs, setActiveTabs] = useState(defaultOpenTabs);

  const currentPath = location.pathname === "/" ? "/home-portal" : location.pathname;
  const currentItem = findItem(currentPath);
  const breadcrumb = [currentItem.group, currentItem.label];

  const openRoute = (path: string) => {
    navigate(path);
    setActiveTabs((prev) => (prev.includes(path) ? prev : [...prev, path]));
  };

  const closeTab = (path: string, event: MouseEvent) => {
    event.stopPropagation();
    const next = activeTabs.filter((item) => item !== path);
    setActiveTabs(next);
    if (currentPath === path) navigate(next[next.length - 1] || "/home-portal");
  };

  return (
    <div className="shell">
      <aside className="sidebar-shell">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <HardHat size={20} color="#fff" />
          </div>
          <div>
            <div className="sidebar-brand-title">脑电工矿帽</div>
            <div className="sidebar-brand-subtitle">智能矿山安全管理</div>
          </div>
        </div>

        <div className="sidebar-action-wrap">
          <button className="button button-primary sidebar-main-action" onClick={() => openRoute("/home-portal")}>
            <Monitor size={16} />
            进入指挥中心
          </button>
        </div>

        <div className="sidebar-section">
          <button className="sidebar-section-trigger" onClick={() => setPersonnelOpen((value) => !value)}>
            <span className="sidebar-section-title">在岗人员</span>
            <span className="sidebar-badge">{onlinePersonnel.length}</span>
            {personnelOpen ? <ChevronDown size={12} color="#6b7280" /> : <ChevronRight size={12} color="#6b7280" />}
          </button>
          {personnelOpen ? (
            <div className="stack-12" style={{ marginTop: 10 }}>
              {onlinePersonnel.map((item) => (
                <div key={item.id} className="soft-panel personnel-item">
                  <span className="personnel-dot" />
                  <span className="personnel-name">{item.name}</span>
                  <span className="personnel-location">{item.location}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">
          {menuGroups.map((group) => (
            <div key={group.group}>
              <button className="sidebar-section-trigger" onClick={() => setOpenGroups((prev) => ({ ...prev, [group.group]: !prev[group.group] }))}>
                <span className="sidebar-section-title">{group.group}</span>
                {openGroups[group.group] ? <ChevronDown size={12} color="#6b7280" /> : <ChevronRight size={12} color="#6b7280" />}
              </button>
              {openGroups[group.group] ? (
                <div className="sidebar-menu-list">
                  {group.items.map((item) => {
                    const active = currentPath === item.path;
                    return (
                      <button key={item.path} onClick={() => openRoute(item.path)} className={`sidebar-menu-item ${active ? "sidebar-menu-item-active" : ""}`}>
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

        <div className="sidebar-version">v2.4.1 · 矿安系统</div>
      </aside>

      <div className="workspace-shell">
        <header className="workspace-header">
          <div className="workspace-breadcrumb">
            <span className="workspace-breadcrumb-faint">首页</span>
            <span className="workspace-breadcrumb-sep">/</span>
            {breadcrumb.map((item, index) => (
              <span key={item} className="workspace-breadcrumb-item">
                <span className={index === breadcrumb.length - 1 ? "workspace-breadcrumb-current" : "workspace-breadcrumb-faint"}>{item}</span>
                {index < breadcrumb.length - 1 ? <span className="workspace-breadcrumb-sep">/</span> : null}
              </span>
            ))}
          </div>

          <div className="workspace-header-actions">
            <button className="button button-secondary icon-only-button" style={{ position: "relative", padding: 10 }}>
              <Bell size={18} />
              <span className="header-notify-dot" />
            </button>
            <div className="workspace-user">
              <div className="workspace-user-avatar">{username.slice(0, 1)}</div>
              <span>{username}</span>
            </div>
            <button className="button button-secondary" onClick={() => { logout(); navigate("/login"); }}>
              <LogOut size={14} />
              退出登录
            </button>
          </div>
        </header>

        <div className="workspace-tabs">
          <div className="workspace-tabs-scroll">
            {activeTabs.map((tabPath) => {
              const item = findItem(tabPath);
              const active = currentPath === tabPath;
              return (
                <button key={tabPath} onClick={() => openRoute(tabPath)} className={`workspace-tab ${active ? "workspace-tab-active" : ""}`}>
                  {active ? <span className="tiny-dot" style={{ background: "#10b981" }} /> : null}
                  {item.label}
                  <span onClick={(event) => closeTab(tabPath, event)} className="workspace-tab-close">
                    <X size={12} />
                  </span>
                </button>
              );
            })}
          </div>
          <div className="workspace-tabs-actions">
            <button className="button button-secondary compact-action" onClick={() => setActiveTabs([currentPath])}>关闭其他</button>
            <button className="button button-secondary compact-action" onClick={() => setActiveTabs([])}>全部关闭</button>
          </div>
        </div>

        <main className="workspace-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
