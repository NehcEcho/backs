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

export function parseJsonInput<T = unknown>(value: string): { ok: true; data: T } | { ok: false; error: string } {
  try {
    return { ok: true, data: JSON.parse(value) as T };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "JSON 解析失败",
    };
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

export function findFirstByKeys(value: unknown, keys: string[]): unknown {
  const queue: unknown[] = [value];
  const seen = new Set<unknown>();

  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object") continue;
    if (seen.has(current)) continue;
    seen.add(current);

    if (Array.isArray(current)) {
      for (const item of current) queue.push(item);
      continue;
    }

    const record = current as Record<string, unknown>;
    for (const key of keys) {
      if (record[key] !== undefined && record[key] !== null && record[key] !== "") {
        return record[key];
      }
    }

    for (const next of Object.values(record)) queue.push(next);
  }

  return undefined;
}

export function findFirstArray(value: unknown): unknown[] | undefined {
  const queue: unknown[] = [value];
  const seen = new Set<unknown>();

  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object") continue;
    if (seen.has(current)) continue;
    seen.add(current);

    if (Array.isArray(current)) {
      if (current.length > 0) return current;
      continue;
    }

    for (const next of Object.values(current as Record<string, unknown>)) queue.push(next);
  }

  return undefined;
}

export function findArrayByObjectKeys(value: unknown, keys: string[]): Array<Record<string, unknown>> {
  const queue: unknown[] = [value];
  const seen = new Set<unknown>();

  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object") continue;
    if (seen.has(current)) continue;
    seen.add(current);

    if (Array.isArray(current)) {
      const objects = current.filter((item): item is Record<string, unknown> => !!item && typeof item === "object" && !Array.isArray(item));
      if (objects.some((item) => keys.some((key) => item[key] !== undefined && item[key] !== null && item[key] !== ""))) {
        return objects;
      }
      for (const item of current) queue.push(item);
      continue;
    }

    for (const next of Object.values(current as Record<string, unknown>)) queue.push(next);
  }

  return [];
}

export function toDatetimeLocalValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "";
  const text = String(value).trim();
  if (!text) return "";

  if (/^\d+$/.test(text)) {
    const milliseconds = text.length <= 10 ? Number(text) * 1000 : Number(text);
    const date = new Date(milliseconds);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (input: number) => String(input).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  const normalized = text.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (input: number) => String(input).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string) {
  if (!value) return "";
  return `${value}:00`;
}

export function toUnixSecondsFromDatetimeLocal(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return String(Math.floor(date.getTime() / 1000));
}

export function toDateInputValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "";
  const text = String(value).trim();
  if (!text) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (input: number) => String(input).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
