export interface GatewayResponse<T = unknown> {
  success: boolean;
  remoteStatus: number;
  message: string;
  payload: T;
  timestamp: string;
}

export interface RequestResult<T = unknown> {
  ok: boolean;
  status: number;
  data: GatewayResponse<T> | null;
  error: string | null;
}

export interface NavItem {
  label: string;
  path: string;
  group: string;
  accent: string;
}

export interface StatItem {
  label: string;
  value: string;
  trend: string;
  color: string;
}
