/** Short, URL-safe, collision-resistant enough for a 60-minute handoff. */
export function newId(length = 10): string {
  const alphabet = '23456789abcdefghjkmnpqrstuvwxyz'
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ''
  for (const b of bytes) out += alphabet[b % alphabet.length]
  return out
}
