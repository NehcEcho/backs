import { useState } from "react";
import { KeyRound, LogIn, UserCircle2 } from "lucide-react";
import { Field, PrimaryButton, ResultPanel, SectionCard, SecondaryButton, StatusBadge } from "@/app/components/common";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/app/lib/api";
import { useRequest } from "@/app/hooks/useRequest";

export function AuthUserPage() {
  const { username } = useAuth();
  const [password, setPassword] = useState("");
  const currentUser = useRequest<any>();
  const updatePassword = useRequest<any>();

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

      <div className="split-two">
        <SectionCard title="当前用户信息" icon={<UserCircle2 size={18} color="#10b981" />}>
          <div className="stack-16">
            <div className="badge-row">
              <PrimaryButton loading={currentUser.loading} onClick={() => currentUser.run(() => api.get("/v1/user"))}>
                <LogIn size={16} />
                获取当前用户
              </PrimaryButton>
            </div>
            <ResultPanel result={currentUser.result} />
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
            <ResultPanel result={updatePassword.result} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
