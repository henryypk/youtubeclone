// src/frontend/config.ts
export const BACKEND_URL = (() => {
    if (typeof window !== "undefined") {
        return window.location.hostname === "localhost"
            ? "http://localhost:3000"
            : "https://SEU-BACKEND.vercel.app"; // substitua pelo seu deploy real
    }
    return "";
})();
