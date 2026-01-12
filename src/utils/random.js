import crypto from 'node:crypto';

export function generateNumericCode(length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}


/**
 * Genera una contraseña temporal segura.
 *
 * @param {number} length Longitud de la contraseña (default: 8)
 * @returns {string}
 */
export function generateTempPassword(length = 8) {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error('Password length must be a positive integer');
  }

  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    'abcdefghijklmnopqrstuvwxyz' +
    '0123456789' +
    '!@#$%^&*_-+=';

  const bytes = crypto.randomBytes(length);
  let password = '';

  for (let i = 0; i < length; i++) {
    password += charset[bytes[i] % charset.length];
  }

  return password;
}