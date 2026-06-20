export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "" : "http://127.0.0.1:8000");

export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || (import.meta.env.PROD
  ? (window.location.protocol === "https:" ? "wss://" : "ws://") + window.location.host
  : API_BASE_URL.replace(/^http/, "ws"));
