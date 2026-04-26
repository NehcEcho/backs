import { useState } from "react";
import { ArrowRight, HardHat, KeyRound, UserRound } from "lucide-react";
import { useNavigate } from "react-router";
import { PrimaryButton } from "@/app/components/common";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/app/lib/api";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const result = await api.post<any>("/login", { username, password });
    setLoading(false);

    const remotePayload = result.data?.payload as any;
    const businessCode = remotePayload?.code;
    const businessMsg = remotePayload?.msg;
    const token = remotePayload?.data?.token || remotePayload?.token;
    const nextUsername = remotePayload?.data?.username || remotePayload?.username || username;
    const businessFailed = typeof businessCode === "number" && businessCode !== 0 && businessCode !== 200;

    if (!result.ok || !token || businessFailed) {
      setError(
        businessMsg ||
          result.error ||
          (token ? "登录失败，请检查账号状态或后端返回" : "账号或密码错误，未获取到有效 token"),
      );
      return;
    }

    login(token, nextUsername);
    navigate("/home-portal");
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div className="panel" style={{ width: "min(1080px, 100%)", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", overflow: "hidden" }}>
        <div style={{ padding: 40, background: "linear-gradient(160deg, rgba(16,185,129,0.16), rgba(59,130,246,0.08), rgba(255,255,255,0.28))", borderRight: "1px solid var(--line)" }}>
          <div style={{ width: 58, height: 58, borderRadius: 22, display: "grid", placeItems: "center", background: "linear-gradient(135deg, rgba(16,185,129,0.92), rgba(5,150,105,0.92))", boxShadow: "0 10px 30px rgba(16,185,129,0.18)" }}>
            <HardHat size={28} color="#fff" />
          </div>
          <h1 style={{ margin: "24px 0 0", fontSize: 34, lineHeight: 1.15, letterSpacing: -1, fontWeight: 700 }}>工矿帽平台接口联调前端</h1>
          <p style={{ marginTop: 16, maxWidth: 480, color: "var(--text-soft)", lineHeight: 1.8 }}>
            整体视觉、玻璃化面板、侧栏结构、标签页和运营控制台节奏均深度参考 `project` 示例，现已扩展为可直接联调后端全部能力的可运行前端。
          </p>
          <div className="grid-3" style={{ marginTop: 28 }}>
            {[
              ["设备与轨迹", "列表、详情、文件、历史定位"],
              ["围栏与告警", "新增、更新、删除、筛选"],
              ["视频与 RTC", "GB28181、私有 RTC、LiveKit"],
            ].map(([title, text]) => (
              <div key={title} className="soft-panel" style={{ padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
                <div style={{ fontSize: 12, color: "var(--text-soft)", marginTop: 8, lineHeight: 1.7 }}>{text}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: 40, display: "flex", alignItems: "center" }}>
          <form onSubmit={submit} className="stack-20" style={{ width: "100%" }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.3 }}>登录后端代理</div>
              <div style={{ fontSize: 14, color: "var(--text-soft)", marginTop: 8 }}>登录成功后将自动保存 token，并供全部模块直接调用。</div>
            </div>

            <label className="field">
              <span className="field-label">用户名</span>
              <div style={{ position: "relative" }}>
                <UserRound size={16} style={{ position: "absolute", left: 14, top: 14, color: "var(--text-faint)" }} />
                <input className="input" style={{ paddingLeft: 40 }} value={username} onChange={(event) => setUsername(event.target.value)} placeholder="请输入公司平台账号" />
              </div>
            </label>

            <label className="field">
              <span className="field-label">密码</span>
              <div style={{ position: "relative" }}>
                <KeyRound size={16} style={{ position: "absolute", left: 14, top: 14, color: "var(--text-faint)" }} />
                <input className="input" style={{ paddingLeft: 40 }} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="请输入密码" />
              </div>
            </label>

            {error ? <div className="soft-panel" style={{ padding: 14, color: "#dc2626", background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.16)" }}>{error}</div> : null}

            <PrimaryButton type="submit" loading={loading}>
              登录并进入控制台
              <ArrowRight size={16} />
            </PrimaryButton>
          </form>
        </div>
      </div>
    </div>
  );
}
