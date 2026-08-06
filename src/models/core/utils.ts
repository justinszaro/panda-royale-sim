/**
 * Generates a unique identifier string.
 *
 * Uses `crypto.randomUUID` when available (browsers, Node ≥ 14.17), and
 * falls back to a base-36 random/timestamp combination in environments that
 * do not expose the Web Crypto API.
 *
 * @returns A unique string suitable for use as an entity ID.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}
