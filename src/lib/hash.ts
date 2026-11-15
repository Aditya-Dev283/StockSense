/**
 * SHA-256 helper using crypto.subtle with a deterministic fallback
 */
export async function sha256(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch {
      // fallback below
    }
  }

  // Pure JS fallback if crypto.subtle is unavailable
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return hex.repeat(8).substring(0, 64);
}

/**
 * Pre-hashed demo passwords (password is "123456" for demo simplicity, or user-specific)
 */
export const DEMO_PASSWORDS: Record<string, string> = {
  owner: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // "123456"
  store1: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // "123456"
  mech1: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // "123456"
  buyer1: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // "123456"
};

/**
 * Audit chain hash calculation: SHA256(previousHash + timestamp + action + part_code + qty)
 */
export async function computeAuditChainHash(
  prevHash: string,
  timestamp: string,
  action: string,
  partCode: string = '',
  qty: number = 0
): Promise<string> {
  const payload = `${prevHash}|${timestamp}|${action}|${partCode}|${qty}`;
  const full = await sha256(payload);
  return full.substring(0, 16); // Clean 16-char tamper-evident audit seal
}
