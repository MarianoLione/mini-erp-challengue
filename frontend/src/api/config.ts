const DEFAULT_API_URL = "http://localhost:5080";

export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? DEFAULT_API_URL).replace(
  /\/$/,
  "",
);
