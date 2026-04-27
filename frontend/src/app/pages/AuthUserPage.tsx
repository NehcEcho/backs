import { useMemo, useState } from "react";
import { KeyRound, LogIn, UserCircle2 } from "lucide-react";
import { Field, HintPanel, PrimaryButton, ResultPreviewList, ResultSummary, SectionCard, SecondaryButton, StatCard, StatusBadge } from "@/app/components/common";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/app/lib/api";
import { useRequest } from "@/app/hooks/useRequest";
import { findFirstByKeys } from "@/app/lib/utils";

export function AuthUserPage() {
  const { username } = useAuth();
  const [password, setPassword] = useState("");
  const currentUser = useRequest<any>();
  const updatePassword = useRequest<any>();

  const profile = currentUser.result?.data?.payload;
  const roleName = useMemo(() => {
    const value = findFirstByKeys(profile, ["roleName"]);
    return value === undefined ? "未加载" : String(value);
  }, [profile]);

  const companyName = useMemo(() => {
    const value = findFirstByKeys(profile, ["companyName"]);
    return value === undefined ? "未加载" : String(value);
  }, [profile]);

  const enableText = useMemo(() => {
    const value = findFirstByKeys(profile, ["enable"]);
    return value === undefined ? "待确认" : (String(value) === "true" ? "启用中" : "已停用");
  }, [profile]);

  const stats = [
    { label: "当前账号", value: username || "未登录", trend: "来自当前 token 会话", color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: <UserCircle2 size={20} color="#10b981" /> },
    { label: "所属单位", value: companyName, trend: "用户资料同步展示", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: <LogIn size={20} color="#3b82f6" /> },
    { label: "角色信息", value: roleName, trend: "决定当前权限范围", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: <KeyRound size={20} color="#f59e0b" /> },
    { label: "账号状态", value: enableText, trend: "来源于用户 enable 字段", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", icon: <KeyRound size={20} color="#8b5cf6" /> },
  ];

  const previewItems = [
    { id: "username", title: username || "未登录", meta: "当前登录账号" },
    { id: "company", title: companyName, meta: "所属单位" },
    { id: "role", title: roleName, meta: "角色名称" },
  ];

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1 className="page-title">认证用户</h1>
          <div className="page-subtitle">对应后端 `AuthUserController`，用于查看当前用户信息并修改密码。</div>
        </div>
        <div className="badge-row">
          <StatusBadge label="Token 自动复用" color="#059669" background="rgba(16,185,129,0.1)" />
        </div>
      </div>

      <div className="grid-4">{stats.map((item) => <StatCard key={item.label} {...item} />)}</div>

      <div className="split-two">
        <SectionCard title="当前用户信息" icon={<UserCircle2 size={18} color="#10b981" />}>
          <div className="stack-16">
            <HintPanel title="账号资料" tone="info">
              这里对应接口文档里的 `/v1/user`，用于查看当前会话所属账号、单位、角色和启用状态，方便确认权限范围是否正确。
            </HintPanel>
            <div className="badge-row">
              <PrimaryButton loading={currentUser.loading} onClick={() => currentUser.run(() => api.get("/v1/user"))}>
                <LogIn size={16} />
                获取当前用户
              </PrimaryButton>
            </div>
            <ResultSummary
              title="账号摘要"
              items={[
                { label: "用户名", value: username || "-" },
                { label: "公司名称", value: companyName },
                { label: "角色", value: roleName },
                { label: "状态", value: enableText },
              ]}
            />
            <ResultPreviewList title="重点字段" items={previewItems} />
            {currentUser.result?.ok === false ? <HintPanel tone="warn" title="账号读取提示">{currentUser.result.error}</HintPanel> : null}
          </div>
        </SectionCard>

        <SectionCard title="修改密码" icon={<KeyRound size={18} color="#f59e0b" />}>
          <div className="stack-16">
            <Field label={`用户名（路径参数）: ${username || "请先登录"}`}>
              <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="输入新密码" type="password" />
            </Field>
            <div className="badge-row">
              <PrimaryButton loading={updatePassword.loading} onClick={() => updatePassword.run(() => api.put(`/v1/users/${encodeURIComponent(username)}/password`, { password }))}>
                提交密码修改
              </PrimaryButton>
              <SecondaryButton onClick={() => setPassword("")}>清空</SecondaryButton>
            </div>
            <ResultSummary
              title="密码修改说明"
              items={[
                { label: "目标账号", value: username || "请先登录" },
                { label: "输入状态", value: password ? `已输入 ${password.length} 位` : "尚未输入新密码" },
              ]}
            />
            {updatePassword.result?.ok === false ? <HintPanel tone="warn" title="密码修改提示">{updatePassword.result.error}</HintPanel> : null}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
