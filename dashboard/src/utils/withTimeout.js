/**
 * Wrap any Promise with a timeout guard so UI never waits forever.
 *
 * Note: This does not cancel the underlying request unless the source
 * request supports cancellation separately. It only bounds waiting time.
 */
import { createTimer, reportDataAccess } from "./dataAccessTelemetry";

function getRuntimeContext() {
  return {
    online: typeof navigator === "undefined" ? null : navigator.onLine,
    visibility:
      typeof document === "undefined" ? null : document.visibilityState,
  };
}

export async function withTimeout(
  promiseOrFactory,
  timeoutMs = 15_000,
  label = "request",
) {
  const stopTimer = createTimer();

  reportDataAccess("request.start", {
    label,
    timeoutMs,
    ...getRuntimeContext(),
  });

  const promise =
    typeof promiseOrFactory === "function"
      ? promiseOrFactory()
      : promiseOrFactory;

  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const err = new Error(`${label} timeout after ${timeoutMs}ms`);
      err.code = "REQUEST_TIMEOUT";
      reportDataAccess("request.timeout", {
        label,
        timeoutMs,
        durationMs: stopTimer(),
        level: "warn",
        error: err.message,
        ...getRuntimeContext(),
      });
      reject(err);
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    reportDataAccess("request.success", {
      label,
      timeoutMs,
      durationMs: stopTimer(),
      ...getRuntimeContext(),
    });
    return result;
  } catch (error) {
    if (error?.code !== "REQUEST_TIMEOUT") {
      reportDataAccess("request.error", {
        label,
        timeoutMs,
        durationMs: stopTimer(),
        level: "error",
        error: error?.message || error,
        ...getRuntimeContext(),
      });
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
