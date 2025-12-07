import { authRepository } from './auth.repository.js';
import { hashPassword, comparePassword } from '../../utils/crypto.js';
import { generateToken } from '../../utils/jwt.js';

class AuthService {
  async register(data) {
    const exists = await authRepository.findByEmail(data.email);
    if (exists) throw new Error('Email ya registrado');

    const hashed = await hashPassword(data.password);

    const user = await authRepository.createUser({
      ...data,
      password: hashed,
    });

    return user;
  }

  async login(email, password) {
    const user = await authRepository.findByEmail(email);
    if (!user) throw new Error('Credenciales inválidas');

    const isValid = await comparePassword(password, user.password);
    if (!isValid) throw new Error('Credenciales inválidas');

    const token = generateToken({ id: user.id, email: user.email });

    return { user, token };
  }

  async updateUser(id, data) {
    await authRepository.updateUser(id, data);
    return { message: 'Usuario actualizado' };
  }

  async deleteUser(id) {
    await authRepository.softDelete(id);
    return { message: 'Usuario eliminado' };
  }

  async getUserByEmail(email) {
    const user = await authRepository.findByEmail(email);
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  }
}

export const authService = new AuthService();
