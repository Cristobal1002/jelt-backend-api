import { authRepository } from './auth.repository.js';
import { hashPassword, comparePassword } from '../../utils/crypto.js';
import { generateToken } from '../../utils/jwt.js';
import { authRecoveryService } from './auth.recovery.facade.js';

import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from '../../errors/http.error.js';
const DEFAULT_ROLE = 'USER';

const register = async (data) => {
  const { email, password, name } = data;

  const existing = await authRepository.findByEmail(email);
  if (existing) {
    throw new BadRequestError('Email is already registered');
  }

  const hashedPassword = await hashPassword(password);

  const user = await authRepository.createUser({
    ...data,
    password: hashedPassword,
    roleName: DEFAULT_ROLE,
  });

  delete user.dataValues.password;

  return user;
};

const login = async ({ email, password }) => {
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

  if (user.isLocked) {
    const { token, user } = await authRecoveryService.loginWithTempCode({ email, password });
    return { token, user, m : 'Temporary login successful' };
  }

  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role?.name,
  });

  delete user.dataValues.password;

  return { token, user };
};

const updateOwnUser = async (userId, data, currentUser) => {
  if (currentUser.id !== Number(userId)) {
    throw new ForbiddenError('You can only update your own account');
  }

  // Nunca permitimos modificar estos campos directamente
  const fieldsToStrip = ['id', 'id_rol', 'isActive', 'isDelete'];
  fieldsToStrip.forEach((f) => delete data[f]);

  // Si viene password, hash; si no, la quitamos
  if (data.password) {
    data.password = await hashPassword(data.password);
  } else {
    delete data.password;
  }

  const updated = await authRepository.updateUser(userId, data);
  if (!updated) {
    throw new NotFoundError('User not found');
  }

  delete updated.dataValues.password;
  return updated;
};

const deleteUser = async (id, currentUser) => {
  
  if (currentUser.role?.name !== 'ADMIN') {
    throw new ForbiddenError('You are not allowed to delete users');
  }

  const deleted = await authRepository.softDelete(id);
  if (!deleted) {
    throw new NotFoundError('User not found');
  }
};

const findByEmail = async (email, currentUser) => {
  if (!email) {
    throw new BadRequestError('Email is required');
  }

  // Si el rol es USER, solo puede verse a sí mismo
  if (currentUser.role?.name === DEFAULT_ROLE && currentUser.email !== email) {
    throw new ForbiddenError('You are not allowed to view other users');
  }

  const user = await authRepository.findByEmail(email);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  delete user.dataValues.password;
  return user;
};

const findById = async (id, currentUser) => {
  const user = await authRepository.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (currentUser.role?.name === 'USER' && currentUser.id !== Number(id)) {
    throw new ForbiddenError('You are not allowed to view other users');
  }

  delete user.dataValues.password;
  return user;
};

export const authService = {
  register,
  login,
  updateOwnUser,
  deleteUser,
  findByEmail,
  findById,
};