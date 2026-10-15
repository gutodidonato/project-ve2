/**
 * Whether this browser can create a WebGL context. Client only: it touches
 * `document`, so call it from an effect or an event handler, never during render.
 * Tries `webgl2` then `webgl`, never throws, and releases the probe context.
 */
export function detectWebgl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) return false;
    // Browsers cap live contexts; do not spend one of them on a probe.
    try {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      // Releasing is best effort: the context was created, so WebGL works.
    }
    return true;
  } catch {
    return false;
  }
}
