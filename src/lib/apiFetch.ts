/** Parse a fetch Response as JSON; surface a clear error when HTML is returned (API server down). */
export async function parseApiJson<T = unknown>(res: Response): Promise<T> {
  const text = await res.text();
  const trimmed = text.trim();
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    throw new Error(
      'API server is not reachable. Restart dev with `npm run dev` (API starts automatically) or run `npm run server` in a second terminal.',
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      res.ok
        ? 'Server returned invalid JSON.'
        : `Request failed (${res.status}): ${text.slice(0, 120)}`,
    );
  }
}
