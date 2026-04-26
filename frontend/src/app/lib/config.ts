export const APP_CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/proxy",
  amapApiKey: import.meta.env.VITE_AMAP_API_KEY || "YOUR_AMAP_API_KEY_HERE",
  amapSecurityJsCode: import.meta.env.VITE_AMAP_SECURITY_JS_CODE || "YOUR_AMAP_SECURITY_JS_CODE_HERE",
  localStorageTokenKey: "mining-hat-access-token",
  localStorageUsernameKey: "mining-hat-username",
};
