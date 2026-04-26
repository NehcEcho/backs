import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
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

export function HintPanel({
  title,
  children,
  tone = "neutral",
  style,
}: {
  title?: string;
  children: ReactNode;
  tone?: "neutral" | "info" | "warn";
  style?: CSSProperties;
}) {
  return (
    <div className={`hint-panel hint-panel-${tone}`} style={style}>
      {title ? <div className="hint-title">{title}</div> : null}
      <div className="hint-content">{children}</div>
    </div>
  );
}

export function JsonErrorNotice({ error }: { error: string | null }) {
  if (!error) return null;
  return <HintPanel tone="warn" title="JSON 输入有误">{error}</HintPanel>;
}

export function QuickFillButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className="button button-secondary quick-fill-button" type="button" {...props}>{children}</button>;
}

export function ResultSummary({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: ReactNode; action?: ReactNode }>;
}) {
  const visibleItems = items.filter((item) => item.value !== undefined && item.value !== null && item.value !== "");
  if (!visibleItems.length) return null;

  return (
    <div className="result-summary">
      <div className="result-summary-title">{title}</div>
      <div className="result-summary-grid">
        {visibleItems.map((item) => (
          <div key={item.label} className="result-summary-item">
            <div className="result-summary-label">{item.label}</div>
            <div className="result-summary-value">{item.value}</div>
            {item.action ? <div className="result-summary-action">{item.action}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResultPreviewList({
  title,
  items,
}: {
  title: string;
  items: Array<{ id: string; title: ReactNode; meta?: ReactNode; action?: ReactNode }>;
}) {
  if (!items.length) return null;

  return (
    <div className="result-summary">
      <div className="result-summary-title">{title}</div>
      <div className="preview-list">
        {items.map((item) => (
          <div key={item.id} className="preview-item">
            <div className="preview-item-main">
              <div className="preview-item-title">{item.title}</div>
              {item.meta ? <div className="preview-item-meta">{item.meta}</div> : null}
            </div>
            {item.action ? <div className="preview-item-action">{item.action}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CompactTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: Array<Array<ReactNode>>;
}) {
  if (!rows.length) return null;

  return (
    <div className="result-summary">
      <div className="result-summary-title">{title}</div>
      <div className="compact-table-wrap">
        <table className="compact-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${title}-${index}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${title}-${index}-${cellIndex}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
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

export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}
