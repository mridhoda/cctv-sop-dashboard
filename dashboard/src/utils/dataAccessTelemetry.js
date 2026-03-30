function nowMs() {
  if (typeof performance !== "undefined" && performance.now) {
    return performance.now();
  }

  return Date.now();
}

export function createTimer() {
  const startedAt = nowMs();
  return () => Math.round(nowMs() - startedAt);
}

export function reportDataAccess(eventName, payload = {}) {
  const entry = {
    event: eventName,
    at: new Date().toISOString(),
    ...payload,
  };

  try {
    if (typeof window !== "undefined") {
      const existing = Array.isArray(window.__VG_DATA_ACCESS__)
        ? window.__VG_DATA_ACCESS__
        : [];
      window.__VG_DATA_ACCESS__ = [...existing.slice(-199), entry];
      window.dispatchEvent(
        new CustomEvent("vg:data-access", {
          detail: entry,
        }),
      );
    }
  } catch {
    /* ignore browser event errors */
  }

  const logPayload = {
    ...entry,
    error: payload?.error?.message || payload?.error || undefined,
  };

  if (payload.level === "error") {
    console.error("[DataAccess]", logPayload);
    return;
  }

  if (payload.level === "warn") {
    console.warn("[DataAccess]", logPayload);
    return;
  }

  console.info("[DataAccess]", logPayload);
}
