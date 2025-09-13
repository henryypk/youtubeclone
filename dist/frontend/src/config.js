// src/frontend/config.ts
export const BACKEND_URL = typeof window !== "undefined"
    ? window.location.origin // sempre aponta para mesmo host do site
    : "http://localhost:3000";
