const configuredBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.EXPO_PUBLIC_BACKEND_BASE_URL ||
  "https://expense-ai-1.onrender.com";

export const BACKEND_BASE_URL = configuredBaseUrl.replace(/\/$/, "");
export const API_BASE_URL = `${BACKEND_BASE_URL}/api`;
