import { authRepository } from './auth.repository.js';
import { hashPassword, comparePassword } from '../../utils/crypto.js';
import { generateToken } from '../../utils/jwt.js';
import { generateTempPassword } from '../../utils/random.js';
import { sendRecoveryMail } from '../../utils/mailer.js';
import {
  UnauthorizedError,
  ForbiddenError,
} from '../../errors/http.error.js';

const ONE_HOUR_MS = 60 * 60 * 1000;

export const requestRecovery = async ({ email }) => {
  const user = await authRepository.findByEmail(email);

  if (!user || !user.isActive || user.isDelete) {
    return { sent: true };
  }

  const code = generateTempPassword(12);
  const hashed = await hashPassword(code);

  // Bloquea la cuenta y guarda código temporal (hash)
  await user.update({
    isLocked: true,
    lockedAt: new Date(),
    tempAccessCode: hashed,
    // tempAccessCodeCreatedAt se setea por hook beforeSave al cambiar tempAccessCode
  });

  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const link = `${appUrl}/auth/login-temp?email=${encodeURIComponent(email)}&password=${encodeURIComponent(code)}`;

  await sendRecoveryMail({ to: email, code, link });

  return { sent: true };
};

export const loginWithTempCode = async ({ email, password }) => {
  
  const code = password;
  const user = await authRepository.findByEmail(email);

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  if (!user.isActive) {
    throw new ForbiddenError('User is inactive');
  }

  if (user.isDelete) {
    throw new ForbiddenError('User is deleted');
  }

  if (!user.isLocked) {
    throw new ForbiddenError('Account is not locked');
  }

  if (!user.tempAccessCode || !user.tempAccessCodeCreatedAt) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const createdAt = new Date(user.tempAccessCodeCreatedAt).getTime();
  const now = Date.now();

  if (now - createdAt > ONE_HOUR_MS) {
    await user.update({
      tempAccessCode: null,
      tempAccessCodeCreatedAt: null,
    });
    throw new UnauthorizedError('Temporary password expired');
  }

  const ok = await comparePassword(code, user.tempAccessCode);
  if (!ok) {
    throw new UnauthorizedError('Invalid credentials');
  }

  await user.update({
    isLocked: false,
    tempAccessCode: null,
    tempAccessCodeCreatedAt: null,
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role?.name,
    mustChangePassword: true,
    tempLogin: true,
  });

  delete user.dataValues.password;

  return { token, user };
};
