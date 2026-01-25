// src/lib/backend.ts
const DEFAULT_BACKEND_URL = "http://localhost:8787";

/**
 * Use .env to override when running on a real phone:
 * EXPO_PUBLIC_BACKEND_URL=http://<YOUR_MAC_IP>:8787
 */
export const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ?? DEFAULT_BACKEND_URL;
