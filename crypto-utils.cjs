const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

const rawKey = process.env.SMTP_ENCRYPTION_KEY;

if (!rawKey) {
  throw new Error('Missing SMTP_ENCRYPTION_KEY environment variable');
}

if (Buffer.byteLength(rawKey, 'utf8') !== 32) {
  throw new Error('SMTP_ENCRYPTION_KEY must be exactly 32 characters to use AES-256-GCM');
}

const ENCRYPTION_KEY = Buffer.from(rawKey, 'utf8');

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(payload) {
  const segments = payload.split(':');

  if (segments.length === 3) {
    const [ivHex, tagHex, encryptedHex] = segments;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  }

  if (segments.length === 2) {
    // Backwards compatibility with legacy AES-256-CBC payloads
    const [ivHex, encryptedHex] = segments;
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  }

  throw new Error('Invalid encrypted payload format');
}

module.exports = { encrypt, decrypt };
