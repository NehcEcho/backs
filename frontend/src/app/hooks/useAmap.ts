import { useEffect, useMemo, useRef, useState } from "react";
import { APP_CONFIG } from "@/app/lib/config";

declare global {
  interface Window {
    AMap?: any;
    _AMapSecurityConfig?: {
      securityJsCode?: string;
    };
  }
}

export function useAmap() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);
  const enabled = useMemo(() => APP_CONFIG.amapApiKey !== "YOUR_AMAP_API_KEY_HERE", []);
  const hasSecurityJsCode = useMemo(
    () => APP_CONFIG.amapSecurityJsCode !== "YOUR_AMAP_SECURITY_JS_CODE_HERE",
    [],
  );

  useEffect(() => {
    if (!enabled) {
      setError("请先在 `.env` 中填写 `VITE_AMAP_API_KEY`");
      return;
    }

    if (!hasSecurityJsCode) {
      setError("请先在 `.env` 中填写 `VITE_AMAP_SECURITY_JS_CODE`");
      return;
    }

    if (window.AMap) {
      setReady(true);
      return;
    }

    if (loadedRef.current) return;
    loadedRef.current = true;
    window._AMapSecurityConfig = {
      securityJsCode: APP_CONFIG.amapSecurityJsCode,
    };
    const script = document.createElement("script");
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${APP_CONFIG.amapApiKey}`;
    script.async = true;
    script.onload = () => setReady(true);
    script.onerror = () => setError("高德地图脚本加载失败，请检查 Web 端 Key、securityJsCode、域名白名单和网络");
    document.head.appendChild(script);
  }, [enabled, hasSecurityJsCode]);

  return { ready, error, enabled };
}
