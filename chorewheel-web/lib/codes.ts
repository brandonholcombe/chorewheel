import { randomBytes, randomUUID } from 'node:crypto';

// Unambiguous alphabet: no 0/O, 1/I/L to keep codes easy to read aloud/type.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** A short, human-shareable household join code, e.g. "K7Q-M4PX". */
export function generateJoinCode(): string {
  const bytes = randomBytes(7);
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]);
  return `${chars.slice(0, 3).join('')}-${chars.slice(3).join('')}`;
}

/** Normalize user-entered codes (case, spacing, stray dashes) for lookup. */
export function normalizeJoinCode(input: string): string {
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length <= 3) return cleaned;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
}

export { randomUUID as id };
