/**
 * Wrap any Promise with a timeout guard so UI never waits forever.
 *
 * Note: This does not cancel the underlying request unless the source
 * request supports cancellation separately. It only bounds waiting time.
 */
export async function withTimeout(
  promiseOrFactory,
  timeoutMs = 15_000,
  label = "request",
) {
  const promise =
    typeof promiseOrFactory === "function"
      ? promiseOrFactory()
      : promiseOrFactory;

  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const err = new Error(`${label} timeout after ${timeoutMs}ms`);
      err.code = "REQUEST_TIMEOUT";
      reject(err);
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}
