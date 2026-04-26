import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { prettyJson } from "@/app/lib/utils";
import type { RequestResult } from "@/app/types";

export function SectionCard({ title, icon, extra, children }: { title: string; icon?: ReactNode; extra?: ReactNode; children: ReactNode }) {
  return (
    <section className="panel stack-16">
      <div className="section-header">
        <div className="section-title">
          {icon}
          <span>{title}</span>
        </div>
        {extra}
      </div>
      <div className="section-body">{children}</div>
    </section>
  );
}

export function StatCard({ label, value, trend, icon, color, bg }: { label: string; value: string; trend: string; icon: ReactNode; color: string; bg: string }) {
  return (
    <div className="stat-card hover-lift">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--text-soft)" }}>{label}</div>
          <div style={{ fontSize: 32, lineHeight: 1.1, fontWeight: 700, letterSpacing: -0.5, color, marginTop: 8 }}>{value}</div>
          <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 8 }}>{trend}</div>
        </div>
        <div style={{ width: 48, height: 48, borderRadius: 16, display: "grid", placeItems: "center", background: bg, boxShadow: `0 4px 12px ${color}20` }}>{icon}</div>
      </div>
    </div>
  );
}

export function StatusBadge({ label, color, background }: { label: string; color: string; background: string }) {
  return (
    <span className="pill" style={{ color, background, borderColor: `${color}33` }}>
      <span className="tiny-dot" style={{ background: color }} />
      {label}
    </span>
  );
}

export function PrimaryButton({ children, loading, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button className="button button-primary" disabled={loading || props.disabled} {...props}>
      {loading ? <LoaderCircle size={16} className="spin" /> : null}
      {children}
    </button>
  );
}

export function SecondaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className="button button-secondary" {...props} />;
}

export function DangerButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className="button button-danger" {...props} />;
}

export function ResultPanel<T>({ result }: { result: RequestResult<T> | null }) {
  if (!result) {
    return <div className="empty-hint" style={{ minHeight: 180 }}>提交任一接口后，这里会显示后端统一返回和原始 payload。</div>;
  }
  return (
    <div className="stack-12">
      <div className="badge-row">
        <StatusBadge label={result.ok ? "调用成功" : "调用失败"} color={result.ok ? "#059669" : "#dc2626"} background={result.ok ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)"} />
        <span className="mini-meta">HTTP {result.status || 0}</span>
        {result.error ? <span className="mini-meta">{result.error}</span> : null}
      </div>
      <pre className="json-box">{prettyJson(result.data)}</pre>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}
