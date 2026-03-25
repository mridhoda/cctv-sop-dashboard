const DEFAULT_BASE_URL = "https://api.foodiserver.my.id";

const stripWrappingQuotes = (value) => value.replace(/^["']+|["']+$/g, "");

const normalizeHttpBaseUrl = (rawValue, fallback = DEFAULT_BASE_URL) => {
  if (!rawValue) return fallback;

  const trimmed = stripWrappingQuotes(String(rawValue).trim());
  if (!trimmed) return fallback;

  // Handle accidental duplicated protocol like: https://https://host
  const deDupedProtocol = trimmed.replace(/^(https?:\/\/)(https?:\/\/)/i, "$2");

  if (!/^https?:\/\//i.test(deDupedProtocol)) return fallback;

  return deDupedProtocol.replace(/\/api\/?$/i, "").replace(/\/+$/, "");
};

export const getApiBaseUrl = () =>
  normalizeHttpBaseUrl(
    import.meta.env.VITE_API_URL || import.meta.env.VITE_WS_URL,
  );

export const getSocketUrl = () =>
  normalizeHttpBaseUrl(
    import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL,
  );
