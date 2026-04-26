export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function prettyJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function safeText(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

export function getNowLabel() {
  return new Date().toLocaleString("zh-CN", { hour12: false });
}

export function formatNumber(input: unknown) {
  if (typeof input === "number") return input.toLocaleString("zh-CN");
  if (typeof input === "string" && input.trim() !== "" && !Number.isNaN(Number(input))) {
    return Number(input).toLocaleString("zh-CN");
  }
  return safeText(input);
}

export function toPuid(deviceId: string) {
  const trimmed = deviceId.trim();
  const suffix = trimmed.slice(-6);
  return suffix ? `PU_${suffix}` : "PU_";
}

export function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}
