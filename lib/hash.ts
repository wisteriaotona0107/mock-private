import crypto from 'crypto';

export async function sha256(buffer: Buffer | Uint8Array): Promise<string> {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
